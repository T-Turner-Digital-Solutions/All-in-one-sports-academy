import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const [revenueBySport, revenueByCoach, statusCounts] = await Promise.all([
    prisma.$queryRaw<Array<{ name: string; total: bigint }>>`
      SELECT s.name as name, COALESCE(SUM(p."amountCents"), 0) as total
      FROM "Sport" s
      LEFT JOIN "Appointment" a ON a."sportId" = s.id
      LEFT JOIN "Payment" p ON p."appointmentId" = a.id AND p.status = 'SUCCEEDED'
      GROUP BY s.name
      ORDER BY total DESC
    `,
    prisma.$queryRaw<Array<{ name: string; total: bigint }>>`
      SELECT (u."firstName" || ' ' || u."lastName") as name, COALESCE(SUM(p."amountCents"), 0) as total
      FROM "Coach" c
      JOIN "User" u ON u.id = c."userId"
      LEFT JOIN "Appointment" a ON a."coachId" = c.id
      LEFT JOIN "Payment" p ON p."appointmentId" = a.id AND p.status = 'SUCCEEDED'
      GROUP BY u."firstName", u."lastName"
      ORDER BY total DESC
    `,
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="mt-1 text-xs text-aio-silver">
          CSV export architecture: every table below is sourced from a typed query — wire a `/export`
          route per report to stream CSV when needed.
        </p>
      </div>

      <section>
        <p className="font-display text-lg font-bold">Revenue by Sport</p>
        <div className="mt-3 space-y-1 text-sm">
          {revenueBySport.map((r) => (
            <div key={r.name} className="flex justify-between border-b border-white/5 py-1">
              <span>{r.name}</span>
              <span>{formatCents(Number(r.total))}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Revenue by Coach</p>
        <div className="mt-3 space-y-1 text-sm">
          {revenueByCoach.map((r) => (
            <div key={r.name} className="flex justify-between border-b border-white/5 py-1">
              <span>{r.name}</span>
              <span>{formatCents(Number(r.total))}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Sessions by Status</p>
        <div className="mt-3 space-y-1 text-sm">
          {statusCounts.map((s) => (
            <div key={s.status} className="flex justify-between border-b border-white/5 py-1">
              <span>{s.status.replaceAll("_", " ")}</span>
              <span>{s._count._all}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
