import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import {
  AddAvailabilityForm,
  AddBlockedTimeForm,
  RemoveAvailabilityButton,
  RemoveBlockedTimeButton,
} from "@/app/coach/availability/AvailabilityForms";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Shared recurring-availability + blocked-time editor. Used on the coach's
 * own /coach/availability page and embedded on the admin coach detail page
 * so an admin can set up a coach's schedule on their behalf.
 */
export async function AvailabilitySection({ coachId }: { coachId: string }) {
  const [availability, blockedTimes] = await Promise.all([
    prisma.coachAvailability.findMany({ where: { coachId, isActive: true, type: "RECURRING" }, orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedTime.findMany({ where: { coachId, endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <p className="font-display text-lg font-bold">Weekly Recurring Availability</p>
        <div className="mt-4 space-y-2">
          {availability.length === 0 ? (
            <p className="text-sm text-aio-silver">No recurring availability set yet.</p>
          ) : (
            availability.map((a) => (
              <div key={a.id} className="aio-card flex items-center justify-between p-3 text-sm">
                <span>
                  {DAYS[a.dayOfWeek!]}: {a.startTime} – {a.endTime}
                </span>
                <RemoveAvailabilityButton coachId={coachId} availabilityId={a.id} />
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <AddAvailabilityForm coachId={coachId} />
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Blocked Time / Time Off</p>
        <p className="mt-1 text-xs text-aio-silver">Booking is not allowed outside active availability or during blocked periods.</p>
        <div className="mt-4 space-y-2">
          {blockedTimes.length === 0 ? (
            <p className="text-sm text-aio-silver">No upcoming blocked time.</p>
          ) : (
            blockedTimes.map((b) => (
              <div key={b.id} className="aio-card flex items-center justify-between p-3 text-sm">
                <span>
                  {formatDateTime(b.startsAt)} – {formatDateTime(b.endsAt)} · {b.reason.replaceAll("_", " ")}
                </span>
                <RemoveBlockedTimeButton coachId={coachId} blockedTimeId={b.id} />
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
