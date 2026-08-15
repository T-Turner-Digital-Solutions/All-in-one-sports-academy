import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Core booking engine: coach qualification, availability computation, and
 * conflict-safe slot holds.
 *
 * Conflict prevention strategy: Appointment has a DB-level
 * @@unique([coachId, startsAt]) constraint. Every hold/booking write goes
 * through createHold(), which relies on that constraint to guarantee that
 * two concurrent requests for the same coach + time can never both succeed —
 * Postgres serializes the two inserts and the loser gets a P2002 error,
 * which we translate into a friendly "slot no longer available" response.
 * This is safe under real concurrency/race conditions, unlike an
 * application-level "check then insert" pattern.
 */

export const HOLD_DURATION_MINUTES = 10;
export const SESSION_LENGTH_MINUTES = 60;
export const MIN_SESSION_HOURS = 1;
export const MAX_SESSION_HOURS = 4;

const OCCUPYING_STATUSES = [
  "HELD",
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
] as const;

export async function getQualifiedCoaches(sportId: string) {
  const coachSports = await prisma.coachSport.findMany({
    where: { sportId, coach: { status: "ACTIVE" } },
    include: { coach: { include: { user: true } } },
  });
  return coachSports.map((cs) => cs.coach);
}

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToDate(base: Date, minutes: number): Date {
  const d = new Date(base);
  d.setHours(0, minutes, 0, 0);
  return d;
}

/**
 * Returns available start times (as Date objects) for a coach on a given
 * calendar date, derived from their recurring/one-time availability minus
 * blocked time and existing appointments. Start times are always on the
 * hour; `durationMinutes` controls how much contiguous room each candidate
 * start time must have free ahead of it to count as available (sessions are
 * booked in whole hours, so this is always a multiple of 60).
 */
export async function getAvailableSlotsForCoachOnDate(
  coachId: string,
  date: Date,
  durationMinutes: number = SESSION_LENGTH_MINUTES
): Promise<Date[]> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const dayOfWeek = dayStart.getDay();

  const [availabilityWindows, blockedTimes, existingAppointments] = await Promise.all([
    prisma.coachAvailability.findMany({
      where: {
        coachId,
        isActive: true,
        OR: [
          { type: "RECURRING", dayOfWeek },
          { type: "ONE_TIME", date: { gte: dayStart, lt: dayEnd } },
        ],
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        OR: [{ coachId }, { orgWide: true }],
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
    }),
    prisma.appointment.findMany({
      where: {
        coachId,
        status: { in: [...OCCUPYING_STATUSES] },
        startsAt: { gte: dayStart, lt: dayEnd },
        OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }],
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const slots: Date[] = [];

  for (const window of availabilityWindows) {
    const startMin = timeStringToMinutes(window.startTime);
    const endMin = timeStringToMinutes(window.endTime);

    for (let m = startMin; m + durationMinutes <= endMin; m += SESSION_LENGTH_MINUTES) {
      const slotStart = minutesToDate(dayStart, m);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

      if (slotStart < new Date()) continue; // no past slots

      const blocked = blockedTimes.some((bt) => bt.startsAt < slotEnd && bt.endsAt > slotStart);
      if (blocked) continue;

      const taken = existingAppointments.some(
        (a) => a.startsAt.getTime() < slotEnd.getTime() && a.endsAt.getTime() > slotStart.getTime()
      );
      if (taken) continue;

      slots.push(slotStart);
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export class SlotUnavailableError extends Error {
  constructor(message = "This time slot is no longer available. Please pick another time.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

type CreateHoldArgs = {
  athleteId: string;
  householdId: string;
  coachId: string;
  sportId: string;
  trainingProgramId?: string | null;
  locationId?: string | null;
  startsAt: Date;
  durationMinutes?: number;
  priceCents: number;
  source?: "PUBLIC_BOOKING" | "ADMIN_MANUAL" | "RECURRING" | "WAITLIST_OFFER";
};

export async function createHold(args: CreateHoldArgs) {
  const endsAt = new Date(args.startsAt.getTime() + (args.durationMinutes ?? SESSION_LENGTH_MINUTES) * 60_000);
  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60_000);

  try {
    return await prisma.appointment.create({
      data: {
        athleteId: args.athleteId,
        householdId: args.householdId,
        coachId: args.coachId,
        sportId: args.sportId,
        trainingProgramId: args.trainingProgramId ?? undefined,
        locationId: args.locationId ?? undefined,
        startsAt: args.startsAt,
        endsAt,
        status: "HELD",
        source: args.source ?? "PUBLIC_BOOKING",
        priceCents: args.priceCents,
        holdExpiresAt,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new SlotUnavailableError();
    }
    throw err;
  }
}

export async function releaseExpiredHolds() {
  const result = await prisma.appointment.updateMany({
    where: { status: "HELD", holdExpiresAt: { lt: new Date() } },
    data: { status: "CLIENT_CANCELLED", cancellationReason: "Hold expired before payment completed." },
  });
  return result.count;
}

/**
 * The academy's hourly training rate, in cents. Training is booked in whole
 * hours (see MIN/MAX_SESSION_HOURS) and priced at this rate × hours booked —
 * this function returns the per-hour rate, not a flat per-booking price.
 */
export async function getSinglSessionPriceCents(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "single_session_price_cents" } });
  if (setting && typeof setting.value === "number") return setting.value;
  const pkg = await prisma.package.findFirst({ where: { type: "SINGLE_SESSION", isActive: true } });
  return pkg?.priceCents ?? 8000;
}
