import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { household: true, appointment: { include: { sport: true, athlete: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Payments</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Household</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2 pr-4">{formatDate(p.createdAt)}</td>
                <td className="py-2 pr-4">{p.household.name}</td>
                <td className="py-2 pr-4">{p.appointment ? `${p.appointment.athlete.firstName} — ${p.appointment.sport.name}` : "Camp"}</td>
                <td className="py-2 pr-4">{formatCents(p.amountCents)}</td>
                <td className={`py-2 pr-4 font-semibold ${p.status === "FAILED" ? "text-aio-red" : ""}`}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
