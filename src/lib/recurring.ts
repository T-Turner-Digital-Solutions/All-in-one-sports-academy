import { prisma } from "@/lib/prisma";
import { Prisma, RecurringAppointment } from "@prisma/client";
import { getSinglSessionPriceCents } from "@/lib/booking";

const GENERATION_HORIZON_DAYS = 90;

function addFrequency(date: Date, frequency: string): Date {
  const d = new Date(date);
  if (frequency === "WEEKLY") d.setDate(d.getDate() + 7);
  else if (frequency === "BIWEEKLY") d.setDate(d.getDate() + 14);
  else if (frequency === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else d.setDate(d.getDate() + 7); // CUSTOM defaults to weekly cadence; admin notes carry specifics
  return d;
}

/**
 * Materializes concrete Appointment rows for a recurring arrangement so the
 * slots are actually blocked on the public booking calendar. Generates up to
 * GENERATION_HORIZON_DAYS ahead, bounded by endDate/numberOfSessions. Skips
 * (and reports) any occurrence that collides with an existing booking.
 */
export async function generateRecurringOccurrences(recurring: RecurringAppointment) {
  const pricePerHourCents = await getSinglSessionPriceCents();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + GENERATION_HORIZON_DAYS);
  const cap = recurring.endDate && recurring.endDate < horizon ? recurring.endDate : horizon;

  // Find the first occurrence on/after startDate matching dayOfWeek.
  const first = new Date(Math.max(recurring.startDate.getTime(), new Date().getTime()));
  while (first.getDay() !== recurring.dayOfWeek) {
    first.setDate(first.getDate() + 1);
  }
  const [startHour, startMin] = recurring.startTime.split(":").map(Number);
  const [endHour, endMin] = recurring.endTime.split(":").map(Number);
  const durationHours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
  const priceCents = recurring.paymentArrangement === "ADMIN_RESERVED" ? 0 : Math.round(pricePerHourCents * durationHours);

  let cursor = new Date(first);
  let created = 0;
  let skipped = 0;
  let sessionsSoFar = await prisma.appointment.count({ where: { recurringAppointmentId: recurring.id } });

  while (cursor <= cap) {
    if (recurring.endType === "AFTER_N_SESSIONS" && recurring.numberOfSessions && sessionsSoFar >= recurring.numberOfSessions) {
      break;
    }

    const startsAt = new Date(cursor);
    startsAt.setHours(startHour, startMin, 0, 0);
    const endsAt = new Date(cursor);
    endsAt.setHours(endHour, endMin, 0, 0);

    try {
      await prisma.appointment.create({
        data: {
          athleteId: recurring.athleteId,
          householdId: (await prisma.athlete.findUniqueOrThrow({ where: { id: recurring.athleteId } })).householdId,
          coachId: recurring.coachId,
          sportId: recurring.sportId,
          trainingProgramId: recurring.trainingProgramId,
          startsAt,
          endsAt,
          status: "SCHEDULED",
          source: "RECURRING",
          priceCents,
          recurringAppointmentId: recurring.id,
        },
      });
      created++;
      sessionsSoFar++;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        skipped++;
      } else {
        throw err;
      }
    }

    cursor = addFrequency(cursor, recurring.frequency);
  }

  return { created, skipped };
}
