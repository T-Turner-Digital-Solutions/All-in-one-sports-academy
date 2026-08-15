import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAge, formatDate, formatDateTime } from "@/lib/format";
import { EvaluationForm } from "./EvaluationForm";

export const dynamic = "force-dynamic";

export default async function CoachAthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const coachId = session!.user.coachId!;

  const hasAppointment = await prisma.appointment.findFirst({ where: { athleteId: id, coachId } });
  if (!hasAppointment) notFound();

  const athlete = await prisma.athlete.findUnique({
    where: { id },
    include: {
      primarySport: true,
      evaluations: { where: { coachId }, orderBy: { evaluationDate: "desc" } },
      progressMetrics: { orderBy: { recordedAt: "desc" } },
      appointments: {
        where: { coachId },
        orderBy: { startsAt: "desc" },
        include: { sport: true, sessionNote: true },
        take: 20,
      },
    },
  });

  if (!athlete) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {athlete.firstName} {athlete.lastName}
        </h1>
        <p className="mt-1 text-aio-silver">
          Age {calculateAge(athlete.dob)} · {athlete.primarySport?.name ?? "No primary sport"} ·{" "}
          {athlete.experienceLevel ?? "Experience level not set"}
        </p>
        {athlete.injuriesRestrictions ? (
          <p className="mt-2 border border-aio-red/40 bg-aio-red/10 px-3 py-2 text-sm text-aio-red">
            Injuries/Restrictions: {athlete.injuriesRestrictions}
          </p>
        ) : null}
        {athlete.developmentGoals ? <p className="mt-2 text-sm text-aio-silver">Goals: {athlete.developmentGoals}</p> : null}
      </div>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">New Evaluation</p>
        <div className="mt-4">
          <EvaluationForm athleteId={athlete.id} />
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Session History (Your Sessions)</p>
        <div className="mt-4 space-y-3">
          {athlete.appointments.map((a) => (
            <div key={a.id} className="border-b border-white/5 pb-3 text-sm last:border-0">
              <p className="font-semibold">
                {formatDateTime(a.startsAt)} — {a.sport.name} ({a.status.replaceAll("_", " ")})
              </p>
              {a.sessionNote?.internalNotes ? (
                <p className="mt-1 text-xs text-aio-red">Internal: {a.sessionNote.internalNotes}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Evaluation History</p>
        <div className="mt-4 space-y-3">
          {athlete.evaluations.map((ev) => (
            <div key={ev.id} className="border-b border-white/5 pb-3 text-sm last:border-0">
              <p className="font-semibold">
                {formatDate(ev.evaluationDate)} {ev.isBaseline ? "(Baseline)" : ""}
              </p>
              <ul className="mt-1 text-xs text-aio-silver">
                {Object.entries((ev.metrics as Record<string, unknown>) ?? {}).map(([k, v]) => (
                  <li key={k}>
                    {k}: {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
