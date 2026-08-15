import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCents } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [today, upcomingCount, athleteCount, earningsThisMonth] = await Promise.all([
    prisma.appointment.findMany({
      where: { coachId, startsAt: { gte: dayStart, lt: dayEnd }, status: { in: ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] } },
      orderBy: { startsAt: "asc" },
      include: { athlete: true, sport: true },
    }),
    prisma.appointment.count({
      where: { coachId, startsAt: { gte: new Date() }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
    }),
    prisma.appointment.findMany({ where: { coachId }, distinct: ["athleteId"], select: { athleteId: true } }),
    prisma.coachEarning.aggregate({
      where: { coachId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { coachAmountCents: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Welcome back, Coach {session!.user.firstName}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's Sessions" value={String(today.length)} />
        <StatCard label="Upcoming Sessions" value={String(upcomingCount)} />
        <StatCard label="Earnings This Month" value={formatCents(earningsThisMonth._sum.coachAmountCents ?? 0)} />
      </div>
      <p className="mt-2 text-xs text-aio-silver">{athleteCount.length} athletes trained overall.</p>

      <div className="mt-10">
        <p className="font-display text-lg font-bold">Today&apos;s Sessions</p>
        <div className="mt-4 space-y-3">
          {today.length === 0 ? (
            <p className="text-sm text-aio-silver">No sessions scheduled today.</p>
          ) : (
            today.map((a) => (
              <Link key={a.id} href={`/coach/sessions/${a.id}`} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">{formatDateTime(a.startsAt)}</p>
                  <p className="text-xs text-aio-silver">
                    {a.athlete.firstName} {a.athlete.lastName} — {a.sport.name}
                  </p>
                </div>
                <span className="text-xs uppercase text-aio-red">{a.status.replaceAll("_", " ")}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="aio-card p-5">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-aio-silver">{label}</p>
    </div>
  );
}
