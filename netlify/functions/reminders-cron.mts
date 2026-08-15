// Netlify Scheduled Function: fires the appointment-reminder pass on its own,
// hourly, without any external cron service. Nothing else in this repo
// triggers /api/cron/reminders on a schedule -- this is that trigger.
//
// `URL` is a built-in Netlify env var pointing at this site's own production
// URL; CRON_SECRET must match the same env var the Next.js API route checks
// (src/app/api/cron/reminders/route.ts) so this function (and only this
// function/an authorized caller) can invoke it.
async function remindersCron() {
  const siteUrl = process.env.URL;
  const secret = process.env.CRON_SECRET;

  if (!siteUrl || !secret) {
    console.error("reminders-cron: missing URL or CRON_SECRET env var, skipping");
    return new Response("Missing configuration", { status: 500 });
  }

  const res = await fetch(`${siteUrl}/api/cron/reminders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });

  const body = await res.text();
  console.log(`reminders-cron: /api/cron/reminders responded ${res.status} ${body}`);
  return new Response(body, { status: res.status });
}

export default remindersCron;

export const config = {
  // Hourly, on the hour -- matches the ~1hr reminder-window bands in
  // sendDueReminders() so every appointment's reminder window gets caught.
  schedule: "0 * * * *",
};
