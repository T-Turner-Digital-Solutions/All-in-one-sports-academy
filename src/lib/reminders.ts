import { prisma } from "@/lib/prisma";
import { notifyRecipients, householdRecipients } from "@/lib/notifications";
import { formatDateTime } from "@/lib/format";
import { RESCHEDULE_WINDOW_HOURS } from "@/lib/policy";
import type { NotificationType } from "@prisma/client";

/**
 * Reminder cadence: 72h reschedule-window notice, 24h reminder, 2h reminder,
 * and a post-session follow-up. Each window is a ~1 hour band so an hourly
 * cron pass reliably catches every appointment once; relatedAppointmentId +
 * type is used to guarantee a reminder is never sent twice for the same
 * appointment. Sent by both email and SMS (to whichever contact info each
 * recipient has on file).
 */
const WINDOWS: Array<{ type: NotificationType; hoursBefore: number; subject: string }> = [
  { type: "RESCHEDULE_WINDOW_72H", hoursBefore: RESCHEDULE_WINDOW_HOURS, subject: "Final rescheduling window for your upcoming session" },
  { type: "REMINDER_24H", hoursBefore: 24, subject: "Reminder: your training session is tomorrow" },
  { type: "REMINDER_2H", hoursBefore: 2, subject: "Your training session starts soon" },
];

export async function sendDueReminders(): Promise<{ sent: number }> {
  let sent = 0;
  const now = new Date();

  for (const window of WINDOWS) {
    const target = new Date(now.getTime() + window.hoursBefore * 60 * 60_000);
    const bandStart = new Date(target.getTime() - 30 * 60_000);
    const bandEnd = new Date(target.getTime() + 30 * 60_000);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startsAt: { gte: bandStart, lte: bandEnd },
      },
      include: {
        athlete: true,
        sport: true,
        coach: { include: { user: true } },
        location: true,
        household: { include: { members: true, contacts: true } },
      },
    });

    for (const appt of appointments) {
      const already = await prisma.notification.findFirst({
        where: { relatedAppointmentId: appt.id, type: window.type },
      });
      if (already) continue;

      await notifyRecipients(householdRecipients(appt.household), {
        subject: window.subject,
        htmlBody: (firstName) => reminderHtmlBody(window.type, appt, firstName),
        smsBody: () => reminderSmsBody(window.type, appt),
        type: window.type,
        relatedAppointmentId: appt.id,
      });
      sent++;
    }
  }

  // Post-session follow-up: invite to book the next session.
  const recentlyCompleted = await prisma.appointment.findMany({
    where: { status: "COMPLETED", startsAt: { gte: new Date(now.getTime() - 24 * 60 * 60_000), lt: now } },
    include: { athlete: true, sport: true, household: { include: { members: true, contacts: true } } },
  });
  for (const appt of recentlyCompleted) {
    const already = await prisma.notification.findFirst({
      where: { relatedAppointmentId: appt.id, type: "POST_SESSION_FOLLOWUP" },
    });
    if (already) continue;

    await notifyRecipients(householdRecipients(appt.household), {
      subject: `How was ${appt.athlete.firstName}'s session?`,
      htmlBody: (firstName) =>
        `<p>Hi ${firstName},</p><p>Great work in ${appt.sport.name} training! Ready for the
          next session? <a href="${process.env.APP_URL}/book">Book training</a> to keep the progress
          going.</p>`,
      smsBody: () => `How was ${appt.athlete.firstName}'s ${appt.sport.name} session? Ready for the next one? Book at ${process.env.APP_URL}/book`,
      type: "POST_SESSION_FOLLOWUP",
      relatedAppointmentId: appt.id,
    });
    sent++;
  }

  return { sent };
}

function reminderHtmlBody(
  type: NotificationType,
  appt: { startsAt: Date; sport: { name: string }; coach: { user: { firstName: string; lastName: string } }; location: { name: string } | null },
  firstName: string
): string {
  if (type === "RESCHEDULE_WINDOW_72H") {
    return `<p>Hi ${firstName},</p><p>This is your final rescheduling window — your ${appt.sport.name}
      session with Coach ${appt.coach.user.firstName} is scheduled for ${formatDateTime(appt.startsAt)}.
      After this point rescheduling will be disabled. Manage it from your client dashboard.</p>`;
  }
  if (type === "REMINDER_2H") {
    return `<p>Reminder: your ${appt.sport.name} session with Coach ${appt.coach.user.firstName} starts
      at ${formatDateTime(appt.startsAt)}${appt.location ? ` at ${appt.location.name}` : ""}.</p>`;
  }
  return `<p>Hi ${firstName},</p><p>Reminder: your ${appt.sport.name} session with Coach
    ${appt.coach.user.firstName} ${appt.coach.user.lastName} is scheduled for
    ${formatDateTime(appt.startsAt)}.</p>`;
}

function reminderSmsBody(
  type: NotificationType,
  appt: { startsAt: Date; sport: { name: string }; coach: { user: { firstName: string; lastName: string } }; location: { name: string } | null }
): string {
  if (type === "RESCHEDULE_WINDOW_72H") {
    return `AIO Sports Academy: Final rescheduling window for your ${appt.sport.name} session with Coach ${appt.coach.user.firstName} on ${formatDateTime(appt.startsAt)}. Reschedule from your dashboard before this window closes.`;
  }
  if (type === "REMINDER_2H") {
    return `AIO Sports Academy: Your ${appt.sport.name} session with Coach ${appt.coach.user.firstName} starts at ${formatDateTime(appt.startsAt)}${appt.location ? ` at ${appt.location.name}` : ""}.`;
  }
  return `AIO Sports Academy: Reminder -- your ${appt.sport.name} session with Coach ${appt.coach.user.firstName} ${appt.coach.user.lastName} is tomorrow, ${formatDateTime(appt.startsAt)}.`;
}
