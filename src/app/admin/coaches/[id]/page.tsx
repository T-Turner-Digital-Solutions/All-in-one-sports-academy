import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompensationForm, StatusButtons, SportToggle } from "./CoachAdminControls";

export const dynamic = "force-dynamic";

export default async function AdminCoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [coach, allSports] = await Promise.all([
    prisma.coach.findUnique({ where: { id }, include: { user: true, sports: { include: { sport: true } } } }),
    prisma.sport.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!coach) notFound();

  const activeSportIds = new Set(coach.sports.map((s) => s.sportId));

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {coach.user.firstName} {coach.user.lastName}
        </h1>
        <p className="text-aio-silver">{coach.user.email}</p>
      </div>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Status</p>
        <div className="mt-4">
          <StatusButtons coachId={coach.id} status={coach.status} />
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Qualified Sports</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {allSports.map((s) => (
            <SportToggle key={s.id} coachId={coach.id} sportId={s.id} sportName={s.name} active={activeSportIds.has(s.id)} />
          ))}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Compensation</p>
        <p className="mt-1 text-xs text-aio-silver">
          Example: client pays $80 → set a $40 flat amount so AIO retains $40, or set 60% for a 60/40 split.
        </p>
        <div className="mt-4">
          <CompensationForm
            coachId={coach.id}
            compensationType={coach.compensationType}
            flatAmountCents={coach.flatAmountCents}
            percentageBps={coach.percentageBps}
            hourlyRateCents={coach.hourlyRateCents}
            compensationNotes={coach.compensationNotes}
          />
        </div>
      </section>
    </div>
  );
}
