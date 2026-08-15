import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packages & Credits" };

export default async function PackagesPage() {
  const session = await auth();
  const householdId = session!.user.householdId!;

  const [balances, credits] = await Promise.all([
    prisma.packageBalance.findMany({ where: { householdId }, include: { package: true } }),
    prisma.payment.findMany({
      where: { householdId, status: "CREDITED", redeemedAt: null },
      include: { appointment: { include: { sport: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Packages & Credits</h1>

      <section>
        <p className="font-display text-lg font-bold">Package Balances</p>
        <div className="mt-4 space-y-3">
          {balances.length === 0 ? (
            <p className="text-sm text-aio-silver">No active packages.</p>
          ) : (
            balances.map((b) => (
              <div key={b.id} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">{b.package.name}</p>
                  <p className="text-xs text-aio-silver">Purchased {formatDate(b.purchasedAt)}</p>
                </div>
                <p className="font-display text-lg font-bold">
                  {b.sessionsRemaining != null ? `${b.sessionsRemaining} left` : "Active"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <p className="font-display text-lg font-bold">Training Credits</p>
        <p className="mt-1 text-xs text-aio-silver">
          Issued when the Academy or your coach cancels a paid session. Mention a credit when booking your
          next session and the Academy will apply it for you.
        </p>
        <div className="mt-4 space-y-3">
          {credits.length === 0 ? (
            <p className="text-sm text-aio-silver">No available credits.</p>
          ) : (
            credits.map((c) => (
              <div key={c.id} className="aio-card flex items-center justify-between p-4">
                <div>
                  <p className="font-display font-semibold">{formatCents(c.amountCents)} credit</p>
                  <p className="text-xs text-aio-silver">
                    {c.appointment?.sport.name} session cancelled {formatDate(c.creditedAt!)}
                  </p>
                </div>
                <ButtonLink href="/book" size="sm" variant="outline">
                  Use Credit
                </ButtonLink>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
