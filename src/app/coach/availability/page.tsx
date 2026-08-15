import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AddAvailabilityForm, AddBlockedTimeForm } from "./AvailabilityForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Availability" };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function CoachAvailabilityPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const [availability, blockedTimes] = await Promise.all([
    prisma.coachAvailability.findMany({ where: { coachId, isActive: true, type: "RECURRING" }, orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedTime.findMany({ where: { coachId, endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Availability</h1>

      <section>
        <p className="font-display text-lg font-bold">Weekly Recurring Availability</p>
        <div className="mt-4 space-y-2">
          {availability.map((a) => (
            <div key={a.id} className="aio-card flex items-center justify-between p-3 text-sm">
              <span>
                {DAYS[a.dayOfWeek!]}: {a.startTime} – {a.endTime}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <AddAvailabilityForm coachId={coachId} />
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Blocked Time / Time Off</p>
        <p className="mt-1 text-xs text-aio-silver">Booking is not allowed outside your active availability or during blocked periods.</p>
        <div className="mt-4 space-y-2">
          {blockedTimes.length === 0 ? (
            <p className="text-sm text-aio-silver">No upcoming blocked time.</p>
          ) : (
            blockedTimes.map((b) => (
              <div key={b.id} className="aio-card p-3 text-sm">
                {formatDateTime(b.startsAt)} – {formatDateTime(b.endsAt)} · {b.reason.replaceAll("_", " ")}
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <AddBlockedTimeForm coachId={coachId} />
        </div>
      </section>
    </div>
  );
}
