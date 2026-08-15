import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { canClientReschedule } from "@/lib/policy";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Sessions" };

export default async function AppointmentsPage() {
  const session = await auth();
  const householdId = session!.user.householdId!;

  const appointments = await prisma.appointment.findMany({
    where: { householdId },
    orderBy: { startsAt: "desc" },
    include: { athlete: true, sport: true, coach: { include: { user: true } } },
    take: 50,
  });

  const upcoming = appointments.filter(
    (a) => a.startsAt >= new Date() && ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(a.status)
  );
  const past = appointments.filter((a) => !upcoming.includes(a));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">My Sessions</h1>
      </div>

      <section>
        <p className="font-display text-lg font-bold">Upcoming</p>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-aio-silver">No upcoming sessions.</p>
          ) : (
            upcoming.map((a) => (
              <Link key={a.id} href={`/dashboard/appointments/${a.id}`} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">
                    {formatDateTime(a.startsAt)} — {a.athlete.firstName} · {a.sport.name}
                  </p>
                  <p className="text-xs text-aio-silver">
                    Coach {a.coach.user.firstName} {a.coach.user.lastName}
                  </p>
                </div>
                <span
                  className={`text-xs font-display uppercase ${
                    canClientReschedule(a.startsAt) ? "text-green-500" : "text-aio-red"
                  }`}
                >
                  {canClientReschedule(a.startsAt) ? "Reschedule Available" : "Reschedule Locked"}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Past</p>
        <div className="mt-4 space-y-3">
          {past.length === 0 ? (
            <p className="text-sm text-aio-silver">No past sessions yet.</p>
          ) : (
            past.map((a) => (
              <Link key={a.id} href={`/dashboard/appointments/${a.id}`} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">
                    {formatDateTime(a.startsAt)} — {a.athlete.firstName} · {a.sport.name}
                  </p>
                  <p className="text-xs text-aio-silver">
                    Coach {a.coach.user.firstName} {a.coach.user.lastName}
                  </p>
                </div>
                <span className="text-xs font-display uppercase text-aio-silver">{a.status.replaceAll("_", " ")}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
