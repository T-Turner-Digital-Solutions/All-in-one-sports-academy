import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const households = await prisma.household.findMany({
    include: { members: true, athletes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Clients (Households)</h1>
      <div className="mt-6 space-y-3">
        {households.map((h) => (
          <div key={h.id} className="aio-card p-4">
            <p className="font-display font-bold">{h.name}</p>
            <p className="text-xs text-aio-silver">
              {h.members.map((m) => m.email).join(", ") || "No parent account yet"} · {h.athletes.length} athlete(s)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
