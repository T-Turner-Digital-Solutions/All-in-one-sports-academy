import { prisma } from "@/lib/prisma";
import { createHold, SlotUnavailableError } from "@/lib/booking";
import { sendEmail, sendSms } from "@/lib/notifications";
import { formatDateTime } from "@/lib/format";

export const WAITLIST_OFFER_MINUTES = 15;

type FreedSlot = {
  sportId: string;
  coachId: string;
  startsAt: Date;
  priceCents: number;
};

/**
 * Called whenever an appointment is cancelled/released. Finds the best
 * matching open waitlist (same sport, same coach if the waitlist specifies
 * one) and offers the freed slot to the next unoffered entry in queue
 * order, for exactly WAITLIST_OFFER_MINUTES.
 */
export async function tryOfferFreedSlotToWaitlist(slot: FreedSlot): Promise<boolean> {
  const waitlists = await prisma.waitlist.findMany({
    where: {
      status: "OPEN",
      sportId: slot.sportId,
      OR: [{ coachId: slot.coachId }, { coachId: null }],
    },
    orderBy: [{ coachId: "desc" }, { createdAt: "asc" }], // coach-specific queues take priority
  });

  for (const waitlist of waitlists) {
    const offered = await offerSlotToWaitlistQueue(waitlist.id, slot);
    if (offered) return true;
  }
  return false;
}

/**
 * Advances a specific waitlist's queue for a concrete freed slot: finds the
 * next entry (by position) that hasn't already been offered this slot in
 * this cycle, and creates a time-boxed hold + offer for them.
 */
export async function offerSlotToWaitlistQueue(waitlistId: string, slot: FreedSlot): Promise<boolean> {
  const entries = await prisma.waitlistEntry.findMany({
    where: { waitlistId, offers: { none: {} } },
    orderBy: { position: "asc" },
    include: { athlete: { include: { household: { include: { members: true } } } } },
  });

  for (const entry of entries) {
    try {
      const appointment = await createHold({
        athleteId: entry.athleteId,
        householdId: entry.athlete.householdId,
        coachId: slot.coachId,
        sportId: slot.sportId,
        startsAt: slot.startsAt,
        priceCents: slot.priceCents,
        source: "WAITLIST_OFFER",
      });

      const expiresAt = new Date(Date.now() + WAITLIST_OFFER_MINUTES * 60_000);
      // hold expiry should match the offer window, not the standard checkout hold window
      await prisma.appointment.update({ where: { id: appointment.id }, data: { holdExpiresAt: expiresAt } });

      await prisma.waitlistOffer.create({
        data: { entryId: entry.id, appointmentId: appointment.id, expiresAt },
      });

      for (const member of entry.athlete.household.members) {
        await sendEmail({
          userId: member.id,
          to: member.email,
          subject: "A training slot just opened up!",
          body: `<p>Hi ${member.firstName},</p><p>A slot for ${formatDateTime(
            slot.startsAt
          )} is available for ${entry.athlete.firstName}. You have ${WAITLIST_OFFER_MINUTES} minutes to
          claim and pay for this session in your client dashboard before it's offered to the next
          person on the waitlist.</p>`,
          type: "WAITLIST_OFFER",
        });
        if (member.phone) {
          await sendSms({
            userId: member.id,
            to: member.phone,
            body: `AIO Sports Academy: A training slot opened for ${entry.athlete.firstName} at ${formatDateTime(
              slot.startsAt
            )}. You have ${WAITLIST_OFFER_MINUTES} min to claim it in your dashboard.`,
            type: "WAITLIST_OFFER",
          });
        }
      }

      return true; // successfully offered — stop here, this cycle is in progress
    } catch (err) {
      if (err instanceof SlotUnavailableError) continue; // shouldn't happen, but keep trying next entry
      throw err;
    }
  }

  // No one left to offer — this waitlist is exhausted for this opening.
  await prisma.waitlist.update({ where: { id: waitlistId }, data: { status: "EXHAUSTED" } });
  return false;
}

/**
 * Cron entry point: expires offers whose 15-minute window has passed,
 * releases the temporarily held appointment, and advances the same
 * waitlist to the next person.
 */
export async function expireStaleWaitlistOffers(): Promise<number> {
  const expired = await prisma.waitlistOffer.findMany({
    where: { status: "OFFERED", expiresAt: { lt: new Date() } },
    include: { appointment: true, entry: true },
  });

  for (const offer of expired) {
    await prisma.$transaction([
      prisma.waitlistOffer.update({
        where: { id: offer.id },
        data: { status: "EXPIRED", respondedAt: new Date() },
      }),
      prisma.appointment.update({
        where: { id: offer.appointmentId },
        data: { status: "CLIENT_CANCELLED", cancellationReason: "Waitlist offer window expired." },
      }),
    ]);

    await offerSlotToWaitlistQueue(offer.entry.waitlistId, {
      sportId: offer.appointment.sportId,
      coachId: offer.appointment.coachId,
      startsAt: offer.appointment.startsAt,
      priceCents: offer.appointment.priceCents,
    });
  }

  return expired.length;
}

export async function declineWaitlistOffer(offerId: string) {
  const offer = await prisma.waitlistOffer.findUnique({ include: { appointment: true, entry: true }, where: { id: offerId } });
  if (!offer || offer.status !== "OFFERED") return;

  await prisma.$transaction([
    prisma.waitlistOffer.update({ where: { id: offer.id }, data: { status: "DECLINED", respondedAt: new Date() } }),
    prisma.appointment.update({
      where: { id: offer.appointmentId },
      data: { status: "CLIENT_CANCELLED", cancellationReason: "Waitlist offer declined." },
    }),
  ]);

  await offerSlotToWaitlistQueue(offer.entry.waitlistId, {
    sportId: offer.appointment.sportId,
    coachId: offer.appointment.coachId,
    startsAt: offer.appointment.startsAt,
    priceCents: offer.appointment.priceCents,
  });
}
