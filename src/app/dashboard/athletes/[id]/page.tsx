import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAge, formatDate, formatDateTime } from "@/lib/format";
import { WaiverSigner } from "./WaiverSigner";
import { WaiverType } from "@prisma/client";

export const dynamic = "force-dynamic";

const ALL_WAIVER_TYPES: WaiverType[] = [
  "PARTICIPATION",
  "LIABILITY_RELEASE",
  "PARENT_GUARDIAN_CONSENT",
  "MEDICAL_ACKNOWLEDGMENT",
  "PHOTO_VIDEO_RELEASE",
];

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const athlete = await prisma.athlete.findUnique({
    where: { id },
    include: {
      primarySport: true,
      waivers: { orderBy: { signedAt: "desc" } },
      evaluations: { orderBy: { evaluationDate: "desc" }, include: { coach: { include: { user: true } } } },
      progressMetrics: { where: { visibleToClient: true }, orderBy: { recordedAt: "desc" } },
      appointments: {
        orderBy: { startsAt: "desc" },
        include: { sport: true, coach: { include: { user: true } }, sessionNote: true },
        take: 20,
      },
    },
  });

  if (!athlete || athlete.householdId !== session!.user.householdId) notFound();

  const signedTypes = new Set(athlete.waivers.map((w) => w.type));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {athlete.firstName} {athlete.lastName}
        </h1>
        <p className="mt-1 text-aio-silver">
          Age {calculateAge(athlete.dob)} · {athlete.primarySport?.name ?? "No primary sport set"} ·{" "}
          {athlete.experienceLevel ?? "Experience level not set"}
        </p>
      </div>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Waivers</p>
        <div className="mt-4 space-y-4">
          {ALL_WAIVER_TYPES.map((type) => {
            const signed = signedTypes.has(type);
            return (
              <div key={type} className="border-b border-white/5 pb-4 last:border-0">
                <p className="text-sm font-semibold">{type.replaceAll("_", " ")}</p>
                {signed ? (
                  <p className="mt-1 text-xs text-green-500">Signed</p>
                ) : (
                  <div className="mt-2">
                    <WaiverSigner athleteId={athlete.id} type={type} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Training History</p>
        <div className="mt-4 space-y-3">
          {athlete.appointments.length === 0 ? (
            <p className="text-sm text-aio-silver">No sessions yet.</p>
          ) : (
            athlete.appointments.map((a) => (
              <div key={a.id} className="border-b border-white/5 pb-3 text-sm last:border-0">
                <p className="font-semibold">
                  {formatDateTime(a.startsAt)} — {a.sport.name} with {a.coach.user.firstName} {a.coach.user.lastName}
                </p>
                <p className="text-xs uppercase tracking-wide text-aio-silver">{a.status.replaceAll("_", " ")}</p>
                {a.sessionNote ? (
                  <div className="mt-2 grid gap-1 text-xs text-aio-silver-light/90">
                    {a.sessionNote.skillsTrained ? <p>Skills trained: {a.sessionNote.skillsTrained}</p> : null}
                    {a.sessionNote.strengths ? <p>Strengths: {a.sessionNote.strengths}</p> : null}
                    {a.sessionNote.areasForImprovement ? <p>Areas for improvement: {a.sessionNote.areasForImprovement}</p> : null}
                    {a.sessionNote.atHomeAssignments ? <p>At-home assignment: {a.sessionNote.atHomeAssignments}</p> : null}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Evaluations</p>
        <div className="mt-4 space-y-3">
          {athlete.evaluations.length === 0 ? (
            <p className="text-sm text-aio-silver">No evaluations recorded yet.</p>
          ) : (
            athlete.evaluations.map((ev) => (
              <div key={ev.id} className="border-b border-white/5 pb-3 text-sm last:border-0">
                <p className="font-semibold">
                  {formatDate(ev.evaluationDate)} — Coach {ev.coach.user.firstName} {ev.coach.user.lastName}
                  {ev.isBaseline ? " (Baseline)" : ""}
                </p>
                <ul className="mt-1 text-xs text-aio-silver-light/90">
                  {Object.entries((ev.metrics as Record<string, unknown>) ?? {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: {String(v)}
                    </li>
                  ))}
                </ul>
                {ev.notes ? <p className="mt-1 text-xs text-aio-silver">{ev.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Progress Measurements</p>
        <div className="mt-4 space-y-2">
          {athlete.progressMetrics.length === 0 ? (
            <p className="text-sm text-aio-silver">No progress measurements yet.</p>
          ) : (
            athlete.progressMetrics.map((m) => (
              <div key={m.id} className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span>{m.metricLabel}</span>
                <span className="font-display font-semibold">
                  {m.value} {m.unit} · {formatDate(m.recordedAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
