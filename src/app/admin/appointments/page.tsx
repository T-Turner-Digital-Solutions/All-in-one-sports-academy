import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments" };

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const appointments = await prisma.appointment.findMany({
    where: status ? { status: status as never } : { status: { not: "HELD" } },
    orderBy: { startsAt: "desc" },
    take: 100,
    include: { athlete: true, sport: true, coach: { include: { user: true } } },
  });

  const filters = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CLIENT_CANCELLED", "COACH_CANCELLED", "NO_SHOW"];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Appointments</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/appointments" className="border border-white/15 px-3 py-1 text-xs uppercase text-aio-silver hover:text-aio-red">
          All
        </Link>
        {filters.map((f) => (
          <Link key={f} href={`/admin/appointments?status=${f}`} className="border border-white/15 px-3 py-1 text-xs uppercase text-aio-silver hover:text-aio-red">
            {f.replaceAll("_", " ")}
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {appointments.map((a) => (
          <Link key={a.id} href={`/admin/appointments/${a.id}`} className="aio-card flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <span>{formatDateTime(a.startsAt)}</span>
            <span>
              {a.athlete.firstName} {a.athlete.lastName} — {a.sport.name}
            </span>
            <span>
              Coach {a.coach.user.firstName} {a.coach.user.lastName}
            </span>
            <span className="text-xs uppercase text-aio-red">{a.status.replaceAll("_", " ")}</span>
          </Link>
        ))}
        {appointments.length === 0 ? <p className="text-sm text-aio-silver">No appointments found.</p> : null}
      </div>
    </div>
  );
}
