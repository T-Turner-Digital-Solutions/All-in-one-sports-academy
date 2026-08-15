import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Earnings" };

export default async function CoachEarningsPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const [earnings, payouts, totals] = await Promise.all([
    prisma.coachEarning.findMany({
      where: { coachId },
      orderBy: { createdAt: "desc" },
      include: { appointment: { include: { athlete: true, sport: true } } },
      take: 50,
    }),
    prisma.payout.findMany({ where: { coachId }, orderBy: { periodStart: "desc" } }),
    prisma.coachEarning.aggregate({ where: { coachId }, _sum: { coachAmountCents: true } }),
  ]);

  const owed = earnings.filter((e) => e.status === "owed").reduce((s, e) => s + e.coachAmountCents, 0);

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Earnings</h1>
      <p className="text-xs text-aio-silver">
        You can only see your own earnings — organization-wide revenue and other coaches&apos; payouts
        are restricted to Academy admin.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="aio-card p-5">
          <p className="font-display text-3xl font-bold">{formatCents(totals._sum.coachAmountCents ?? 0)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-aio-silver">Lifetime Earnings</p>
        </div>
        <div className="aio-card p-5">
          <p className="font-display text-3xl font-bold text-aio-red">{formatCents(owed)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-aio-silver">Currently Owed</p>
        </div>
      </div>

      <section>
        <p className="font-display text-lg font-bold">Session Earnings</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Athlete</th>
                <th className="py-2 pr-4">Your Share</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">{formatDate(e.createdAt)}</td>
                  <td className="py-2 pr-4">
                    {e.appointment.athlete.firstName} — {e.appointment.sport.name}
                  </td>
                  <td className="py-2 pr-4">{formatCents(e.coachAmountCents)}</td>
                  <td className="py-2 pr-4 capitalize">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Payout History</p>
        <div className="mt-4 space-y-2">
          {payouts.length === 0 ? (
            <p className="text-sm text-aio-silver">No payouts issued yet.</p>
          ) : (
            payouts.map((p) => (
              <div key={p.id} className="aio-card flex justify-between p-3 text-sm">
                <span>
                  {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                </span>
                <span className="font-display font-bold">{formatCents(p.amountCents)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
