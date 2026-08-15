import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAge, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const athlete = await prisma.athlete.findUnique({
    where: { id },
    include: {
      household: { include: { members: true } },
      primarySport: true,
      waivers: true,
      appointments: { orderBy: { startsAt: "desc" }, take: 20, include: { sport: true, coach: { include: { user: true } } } },
      evaluations: { orderBy: { evaluationDate: "desc" }, take: 10 },
    },
  });
  if (!athlete) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {athlete.firstName} {athlete.lastName}
        </h1>
        <p className="text-aio-silver">
          Age {calculateAge(athlete.dob)} · {athlete.primarySport?.name ?? "No primary sport"} ·{" "}
          {athlete.household.name}
        </p>
        <p className="text-xs text-aio-silver">Guardians: {athlete.household.members.map((m) => m.email).join(", ")}</p>
        {athlete.injuriesRestrictions ? (
          <p className="mt-2 border border-aio-red/40 bg-aio-red/10 px-3 py-2 text-sm text-aio-red">
            Injuries/Restrictions: {athlete.injuriesRestrictions}
          </p>
        ) : null}
        {athlete.medicalNotes ? <p className="mt-2 text-sm text-aio-silver">Medical: {athlete.medicalNotes}</p> : null}
      </div>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Waivers</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {athlete.waivers.length === 0 ? (
            <p className="text-sm text-aio-silver">No waivers signed.</p>
          ) : (
            athlete.waivers.map((w) => (
              <span key={w.id} className="border border-green-500/40 px-2 py-1 text-xs text-green-500">
                {w.type.replaceAll("_", " ")}
              </span>
            ))
          )}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Appointment History</p>
        <div className="mt-3 space-y-2 text-sm">
          {athlete.appointments.map((a) => (
            <p key={a.id}>
              {formatDateTime(a.startsAt)} — {a.sport.name} with {a.coach.user.firstName} ({a.status.replaceAll("_", " ")})
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
