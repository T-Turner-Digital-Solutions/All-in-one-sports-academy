import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { canClientReschedule } from "@/lib/policy";
import { tryOfferFreedSlotToWaitlist } from "@/lib/waitlist";
import { sendEmail } from "@/lib/notifications";
import { formatDateTime } from "@/lib/format";
import { logAudit } from "@/lib/audit";

export class ForbiddenActionError extends Error {}
export class SlotConflictError extends Error {
  constructor() {
    super("That time is no longer available. Please choose another.");
  }
}

const ACTIVE_STATUSES = ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] as const;

type CancelReason = "CLIENT_CANCELLED" | "COACH_CANCELLED" | "LATE_CANCELLATION" | "NO_SHOW";

export async function cancelAppointment(args: {
  appointmentId: string;
  status: CancelReason;
  reason: string;
  cancelledByUserId?: string;
  transferCredit: boolean; // true when AIO/coach initiated — client keeps a usable credit
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: args.appointmentId },
    include: { payment: true, household: { include: { members: true } }, coach: { include: { user: true } }, sport: true },
  });
  if (!appointment) throw new Error("Appointment not found");
  if (!(ACTIVE_STATUSES as readonly string[]).includes(appointment.status)) {
    throw new Error("This appointment can no longer be cancelled.");
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: args.status,
      cancelledAt: new Date(),
      cancelledBy: args.cancelledByUserId,
      cancellationReason: args.reason,
    },
  });

  if (args.transferCredit && appointment.payment && appointment.payment.status === "SUCCEEDED") {
    await prisma.payment.update({
      where: { id: appointment.payment.id },
      data: { status: "CREDITED", creditedAt: new Date(), creditReason: args.reason },
    });
    for (const member of appointment.household.members) {
      await sendEmail({
        userId: member.id,
        to: member.email,
        subject: "Your session was cancelled — credit issued",
        body: `<p>Hi ${member.firstName},</p><p>Your ${formatDateTime(appointment.startsAt)} session with
          Coach ${appointment.coach.user.firstName} was cancelled by the Academy. Your payment has been
          converted to a training credit you can apply toward a future session from your dashboard.</p>`,
        type: "COACH_SUBSTITUTION",
      });
    }
  }

  await logAudit({
    actorId: args.cancelledByUserId,
    action: "appointment.cancelled",
    recordType: "Appointment",
    recordId: appointment.id,
    before: { status: appointment.status },
    after: { status: args.status, reason: args.reason },
  });

  // Offer the freed slot to anyone waiting for this sport/coach/time.
  await tryOfferFreedSlotToWaitlist({
    sportId: appointment.sportId,
    coachId: appointment.coachId,
    startsAt: appointment.startsAt,
    durationMinutes: (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
    priceCents: appointment.priceCents,
  });

  return appointment;
}

export async function rescheduleAppointment(args: {
  appointmentId: string;
  newStartsAt: Date;
  actingUserId: string;
  isAdminOverride: boolean;
}) {
  const appointment = await prisma.appointment.findUnique({ where: { id: args.appointmentId } });
  if (!appointment) throw new Error("Appointment not found");
  if (!(ACTIVE_STATUSES as readonly string[]).includes(appointment.status)) {
    throw new Error("This appointment can no longer be rescheduled.");
  }

  if (!args.isAdminOverride && !canClientReschedule(appointment.startsAt)) {
    throw new ForbiddenActionError(
      "Rescheduling is only available up to 72 hours before your session. Contact the Academy for an exception."
    );
  }

  const newEndsAt = new Date(args.newStartsAt.getTime() + (appointment.endsAt.getTime() - appointment.startsAt.getTime()));

  let newAppointment;
  try {
    newAppointment = await prisma.appointment.create({
      data: {
        athleteId: appointment.athleteId,
        householdId: appointment.householdId,
        coachId: appointment.coachId,
        sportId: appointment.sportId,
        trainingProgramId: appointment.trainingProgramId,
        locationId: appointment.locationId,
        startsAt: args.newStartsAt,
        endsAt: newEndsAt,
        status: "CONFIRMED", // already paid — no new payment required
        source: appointment.source,
        priceCents: appointment.priceCents,
        rescheduledFromId: appointment.id,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new SlotConflictError();
    }
    throw err;
  }

  await prisma.$transaction([
    prisma.appointment.update({ where: { id: appointment.id }, data: { status: "RESCHEDULED" } }),
    prisma.attendance.upsert({
      where: { appointmentId: newAppointment.id },
      update: { status: "CONFIRMED" },
      create: { appointmentId: newAppointment.id, status: "CONFIRMED" },
    }),
  ]);

  await logAudit({
    actorId: args.actingUserId,
    action: "appointment.rescheduled",
    recordType: "Appointment",
    recordId: appointment.id,
    before: { startsAt: appointment.startsAt },
    after: { startsAt: args.newStartsAt, newAppointmentId: newAppointment.id },
  });

  // The original slot is now free — offer it to the waitlist too.
  await tryOfferFreedSlotToWaitlist({
    sportId: appointment.sportId,
    coachId: appointment.coachId,
    startsAt: appointment.startsAt,
    durationMinutes: (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
    priceCents: appointment.priceCents,
  });

  return newAppointment;
}
