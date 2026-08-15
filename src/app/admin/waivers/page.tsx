import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waivers" };

export default async function AdminWaiversPage() {
  const athletes = await prisma.athlete.findMany({
    where: { isActive: true },
    include: { household: true, waivers: true },
    orderBy: { firstName: "asc" },
  });

  const REQUIRED = ["PARTICIPATION", "LIABILITY_RELEASE", "PARENT_GUARDIAN_CONSENT", "MEDICAL_ACKNOWLEDGMENT"];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Waivers</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">Athlete</th>
              <th className="py-2 pr-4">Household</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a) => {
              const signed = new Set(a.waivers.map((w) => w.type));
              const missing = REQUIRED.filter((t) => !signed.has(t as never));
              return (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    {a.firstName} {a.lastName}
                  </td>
                  <td className="py-2 pr-4">{a.household.name}</td>
                  <td className={`py-2 pr-4 font-semibold ${missing.length === 0 ? "text-green-500" : "text-aio-red"}`}>
                    {missing.length === 0 ? "Complete" : `Missing ${missing.length}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
