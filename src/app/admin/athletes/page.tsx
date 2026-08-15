import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateAge } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Athletes" };

export default async function AdminAthletesPage() {
  const athletes = await prisma.athlete.findMany({
    where: { isActive: true },
    include: { household: true, primarySport: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Athletes</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Age</th>
              <th className="py-2 pr-4">Sport</th>
              <th className="py-2 pr-4">Household</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a) => (
              <tr key={a.id} className="border-b border-white/5">
                <td className="py-2 pr-4">
                  <Link href={`/admin/athletes/${a.id}`} className="hover:text-aio-red">
                    {a.firstName} {a.lastName}
                  </Link>
                </td>
                <td className="py-2 pr-4">{calculateAge(a.dob)}</td>
                <td className="py-2 pr-4">{a.primarySport?.name ?? "—"}</td>
                <td className="py-2 pr-4">{a.household.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
