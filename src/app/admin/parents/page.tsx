import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parents" };

export default async function AdminParentsPage() {
  const parents = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { household: { include: { athletes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Parents</h1>
      <p className="mt-1 text-aio-silver">Every parent/guardian account, with the athletes under their household.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Athletes</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2 pr-4">
                  {p.firstName} {p.lastName}
                </td>
                <td className="py-2 pr-4">{p.email}</td>
                <td className="py-2 pr-4">{p.household?.athletes.map((a) => a.firstName).join(", ") || "—"}</td>
                <td className="py-2 pr-4">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
