import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";
import { formatDateTime, formatCents } from "@/lib/format";

/**
 * Single place where a payment transitions to SUCCEEDED. Called from both
 * the dev-mode checkout fallback and the Stripe webhook so appointment
 * confirmation, coach earnings, and notifications are computed exactly once
 * regardless of which path completed the payment. Idempotent: re-invoking
 * for an already-succeeded payment is a no-op.
 */
export async function finalizeSuccessfulPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { appointment: true, campRegistration: true },
  });
  if (!payment) return;
  if (payment.status === "SUCCEEDED") return; // already processed

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "SUCCEEDED" } });

  if (payment.appointment) {
    await handleAppointmentPaymentSuccess(payment.appointment.id, payment.amountCents);
  }

  if (payment.campRegistration) {
    await prisma.campRegistration.update({
      where: { id: payment.campRegistration.id },
      data: { status: "CONFIRMED" },
    });
    await handleCampPaymentSuccess(payment.campRegistration.id);
  }
}

async function handleCampPaymentSuccess(campRegistrationId: string) {
  const registration = await prisma.campRegistration.findUnique({
    where: { id: campRegistrationId },
    include: { camp: true, athlete: { include: { household: { include: { members: true } } } } },
  });
  if (!registration) return;

  for (const member of registration.athlete.household.members) {
    await sendEmail({
      userId: member.id,
      to: member.email,
      subject: `Registration Confirmed: ${registration.camp.name}`,
      body: `<p>Hi ${member.firstName},</p><p>${registration.athlete.firstName} is registered for
        ${registration.camp.name} on ${formatDateTime(registration.camp.startsAt)}. Amount charged:
        ${formatCents(registration.camp.priceCents)}. This payment is final and nonrefundable.</p>`,
      type: "BOOKING_CONFIRMATION",
    });
  }
}

async function handleAppointmentPaymentSuccess(appointmentId: string, grossAmountCents: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      athlete: true,
      sport: true,
      household: { include: { members: true } },
      coach: { include: { user: true } },
    },
  });
  if (!appointment) return;

  if (appointment.status === "HELD") {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CONFIRMED" } });
  }

  if (appointment.source === "WAITLIST_OFFER") {
    const offer = await prisma.waitlistOffer.findUnique({ where: { appointmentId }, include: { entry: true } });
    if (offer && offer.status === "OFFERED") {
      await prisma.waitlistOffer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
      await prisma.waitlist.update({ where: { id: offer.entry.waitlistId }, data: { status: "FULFILLED" } });
    }
  }

  const existingAttendance = await prisma.attendance.findUnique({ where: { appointmentId } });
  if (!existingAttendance) {
    await prisma.attendance.create({ data: { appointmentId, status: "CONFIRMED" } });
  }

  const existingEarning = await prisma.coachEarning.findUnique({ where: { appointmentId } });
  if (!existingEarning) {
    const { coachAmountCents, orgAmountCents } = computeCoachSplit(appointment.coach, grossAmountCents);
    await prisma.coachEarning.create({
      data: {
        coachId: appointment.coachId,
        appointmentId,
        grossAmountCents,
        coachAmountCents,
        orgAmountCents,
      },
    });
  }

  for (const member of appointment.household.members) {
    await sendEmail({
      userId: member.id,
      to: member.email,
      subject: "Booking Confirmed — All In One Sports Academy",
      body: `<p>Hi ${member.firstName},</p>
        <p>${appointment.athlete.firstName}'s ${appointment.sport.name} session with Coach
        ${appointment.coach.user.firstName} ${appointment.coach.user.lastName} is confirmed for
        ${formatDateTime(appointment.startsAt)}.</p>
        <p>Amount charged: ${formatCents(grossAmountCents)}. All payments are final and nonrefundable;
        you may reschedule up to 72 hours before your session from your dashboard.</p>`,
      type: "BOOKING_CONFIRMATION",
    });
  }
}

type CoachForSplit = {
  compensationType: string;
  flatAmountCents: number | null;
  percentageBps: number | null;
};

export function computeCoachSplit(coach: CoachForSplit, grossAmountCents: number) {
  let coachAmountCents = 0;
  switch (coach.compensationType) {
    case "FLAT_PER_SESSION":
      coachAmountCents = coach.flatAmountCents ?? 0;
      break;
    case "PERCENTAGE":
      coachAmountCents = Math.round((grossAmountCents * (coach.percentageBps ?? 0)) / 10000);
      break;
    case "HOURLY":
    case "CUSTOM":
    default:
      coachAmountCents = 0; // requires manual/custom calculation by admin
      break;
  }
  coachAmountCents = Math.min(coachAmountCents, grossAmountCents);
  return { coachAmountCents, orgAmountCents: grossAmountCents - coachAmountCents };
}
