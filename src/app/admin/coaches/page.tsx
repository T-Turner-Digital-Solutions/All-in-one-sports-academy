import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coaches" };

export default async function AdminCoachesPage() {
  const coaches = await prisma.coach.findMany({
    include: { user: true, sports: { include: { sport: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Coaches</h1>
      <div className="mt-6 space-y-3">
        {coaches.map((c) => (
          <Link key={c.id} href={`/admin/coaches/${c.id}`} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">
                {c.user.firstName} {c.user.lastName}
              </p>
              <p className="text-xs text-aio-silver">
                {c.sports.map((s) => s.sport.name).join(", ") || "No sports assigned"} · {c.status}
              </p>
            </div>
            <p className="text-xs text-aio-silver">
              {c.compensationType === "FLAT_PER_SESSION"
                ? `${formatCents(c.flatAmountCents ?? 0)}/session`
                : c.compensationType === "PERCENTAGE"
                ? `${(c.percentageBps ?? 0) / 100}%`
                : c.compensationType}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
