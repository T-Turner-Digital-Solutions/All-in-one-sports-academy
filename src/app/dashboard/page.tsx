import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await auth();
  const householdId = session!.user.householdId!;

  const [nextSession, upcomingCount, unsignedWaiversCount, athletes] = await Promise.all([
    prisma.appointment.findFirst({
      where: { householdId, status: { in: ["SCHEDULED", "CONFIRMED"] }, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      include: { athlete: true, coach: { include: { user: true } }, sport: true, location: true },
    }),
    prisma.appointment.count({
      where: { householdId, status: { in: ["SCHEDULED", "CONFIRMED"] }, startsAt: { gte: new Date() } },
    }),
    prisma.athlete.count({
      where: { householdId, isActive: true, waivers: { none: { type: "PARTICIPATION" } } },
    }),
    prisma.athlete.findMany({ where: { householdId, isActive: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Welcome back, {session!.user.firstName}</h1>
      <p className="mt-1 text-aio-silver">Here&apos;s what&apos;s happening with your household.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming Sessions" value={String(upcomingCount)} />
        <StatCard label="Athlete Profiles" value={String(athletes.length)} />
        <StatCard label="Unsigned Waivers" value={String(unsignedWaiversCount)} alert={unsignedWaiversCount > 0} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="aio-card p-6 lg:col-span-2">
          <p className="font-display text-lg font-bold">Next Session</p>
          {nextSession ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-display text-xl font-bold text-aio-red">{formatDateTime(nextSession.startsAt)}</p>
              <p>
                {nextSession.athlete.firstName} &middot; {nextSession.sport.name} with{" "}
                {nextSession.coach.user.firstName} {nextSession.coach.user.lastName}
              </p>
              {nextSession.location ? <p className="text-aio-silver">{nextSession.location.name}</p> : null}
              <Link href={`/dashboard/appointments/${nextSession.id}`} className="mt-3 inline-block text-aio-red hover:underline">
                View & Manage Session →
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-aio-silver">No upcoming sessions booked yet.</p>
              <ButtonLink href="/book" className="mt-4">
                Book Training
              </ButtonLink>
            </div>
          )}
        </div>

        <div className="aio-card p-6">
          <p className="font-display text-lg font-bold">Quick Actions</p>
          <div className="mt-4 flex flex-col gap-3">
            <ButtonLink href="/book" size="sm">
              Book Training — $80/hr
            </ButtonLink>
            <ButtonLink href="/dashboard/athletes" variant="outline" size="sm">
              Manage Athletes
            </ButtonLink>
            <ButtonLink href="/dashboard/waivers" variant="outline" size="sm">
              Sign Waivers
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="aio-card p-5">
      <p className={`font-display text-3xl font-bold ${alert ? "text-aio-red" : "text-aio-white"}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-aio-silver">{label}</p>
    </div>
  );
}
