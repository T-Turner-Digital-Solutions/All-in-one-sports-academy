import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Schedule" };

export default async function CoachSchedulePage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const [upcoming, past] = await Promise.all([
    prisma.appointment.findMany({
      where: { coachId, startsAt: { gte: new Date() }, status: { in: ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] } },
      orderBy: { startsAt: "asc" },
      include: { athlete: true, sport: true },
    }),
    prisma.appointment.findMany({
      where: { coachId, startsAt: { lt: new Date() } },
      orderBy: { startsAt: "desc" },
      take: 25,
      include: { athlete: true, sport: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Schedule</h1>
      <section>
        <p className="font-display text-lg font-bold">Upcoming</p>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-aio-silver">No upcoming sessions.</p>
          ) : (
            upcoming.map((a) => (
              <Link key={a.id} href={`/coach/sessions/${a.id}`} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">{formatDateTime(a.startsAt)}</p>
                  <p className="text-xs text-aio-silver">
                    {a.athlete.firstName} {a.athlete.lastName} — {a.sport.name}
                  </p>
                </div>
                <span className="text-xs uppercase text-aio-silver">{a.status.replaceAll("_", " ")}</span>
              </Link>
            ))
          )}
        </div>
      </section>
      <section>
        <p className="font-display text-lg font-bold">Recent</p>
        <div className="mt-4 space-y-3">
          {past.map((a) => (
            <Link key={a.id} href={`/coach/sessions/${a.id}`} className="aio-card flex items-center justify-between p-4">
              <div>
                <p className="font-display font-semibold">{formatDateTime(a.startsAt)}</p>
                <p className="text-xs text-aio-silver">
                  {a.athlete.firstName} {a.athlete.lastName} — {a.sport.name}
                </p>
              </div>
              <span className="text-xs uppercase text-aio-silver">{a.status.replaceAll("_", " ")}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
