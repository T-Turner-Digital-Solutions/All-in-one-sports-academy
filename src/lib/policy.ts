/**
 * Cancellation & Rescheduling Policy — single source of truth for the policy
 * text, version, and the 72-hour reschedule window rule used across the
 * booking flow, client dashboard, and reminder copy.
 */

export const CURRENT_POLICY_VERSION = "2026-01-v1";

export const RESCHEDULE_WINDOW_HOURS = 72;

export const POLICY_ACCEPTANCE_TEXT =
  "I have read and agree to the All In One Sports Academy Cancellation & Rescheduling Policy. I understand that all payments are final and nonrefundable.";

export const CANCELLATION_POLICY_BODY = `
All In One Sports Academy — Cancellation & Rescheduling Policy (${CURRENT_POLICY_VERSION})

1. All payments for private training sessions, packages, camps, and clinics are final and
   nonrefundable.
2. Clients may reschedule a booked session up to ${RESCHEDULE_WINDOW_HOURS} hours (3 days) before
   the scheduled start time at no additional charge, using the "Reschedule My Session" action
   in the client dashboard, on the appointment page, or from a confirmation/reminder message.
3. Rescheduling is automatically disabled once fewer than ${RESCHEDULE_WINDOW_HOURS} hours remain
   before the appointment. Academy administrators may override this restriction on a
   case-by-case basis.
4. If All In One Sports Academy or the assigned coach cancels a session for any reason, the
   client's payment is converted to a training credit that may be applied toward another
   available appointment.
5. No-shows and late cancellations (inside the ${RESCHEDULE_WINDOW_HOURS}-hour window) are not
   eligible for refund or automatic credit.
`.trim();

export function hoursUntil(date: Date, now: Date = new Date()): number {
  return (date.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function canClientReschedule(appointmentStartsAt: Date, now: Date = new Date()): boolean {
  return hoursUntil(appointmentStartsAt, now) >= RESCHEDULE_WINDOW_HOURS;
}
