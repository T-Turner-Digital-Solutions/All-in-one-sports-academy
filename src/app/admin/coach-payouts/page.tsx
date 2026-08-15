import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/format";
import { IssuePayoutButton } from "./IssuePayoutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coach Payouts" };

export default async function AdminCoachPayoutsPage() {
  const coaches = await prisma.coach.findMany({
    include: {
      user: true,
      earnings: true,
      payouts: { orderBy: { periodEnd: "desc" }, take: 5 },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Coach Payouts</h1>
        <p className="mt-1 text-xs text-aio-silver">
          Only Justin and Academy admins can see organization-wide payout data — coaches only see their own.
        </p>
      </div>

      <div className="space-y-4">
        {coaches.map((c) => {
          const owed = c.earnings.filter((e) => e.status === "owed").reduce((s, e) => s + e.coachAmountCents, 0);
          const grossTotal = c.earnings.reduce((s, e) => s + e.grossAmountCents, 0);
          const orgTotal = c.earnings.reduce((s, e) => s + e.orgAmountCents, 0);
          return (
            <div key={c.id} className="aio-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display font-bold">
                    {c.user.firstName} {c.user.lastName}
                  </p>
                  <p className="text-xs text-aio-silver">
                    Gross sales {formatCents(grossTotal)} · AIO share {formatCents(orgTotal)} · Owed {formatCents(owed)}
                  </p>
                </div>
                {owed > 0 ? <IssuePayoutButton coachId={c.id} /> : <span className="text-xs text-aio-silver">Fully paid</span>}
              </div>
              {c.payouts.length > 0 ? (
                <div className="mt-3 space-y-1 text-xs text-aio-silver">
                  {c.payouts.map((p) => (
                    <p key={p.id}>
                      {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}: {formatCents(p.amountCents)}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
