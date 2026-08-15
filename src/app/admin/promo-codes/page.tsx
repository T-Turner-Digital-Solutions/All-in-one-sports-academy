import { prisma } from "@/lib/prisma";
import { CreatePromoForm, TogglePromoButton } from "./PromoForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Promo Codes" };

export default async function AdminPromoCodesPage() {
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Promo Codes</h1>
      <CreatePromoForm />
      <div className="space-y-3">
        {codes.map((c) => (
          <div key={c.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{c.code}</p>
              <p className="text-xs text-aio-silver">
                {c.discountType === "PERCENTAGE" ? `${c.percentOff}% off` : `$${(c.amountOffCents ?? 0) / 100} off`} · Used{" "}
                {c.usesCount}
                {c.maxUses ? `/${c.maxUses}` : ""} · {c.isActive ? "Active" : "Disabled"}
              </p>
            </div>
            <TogglePromoButton id={c.id} isActive={c.isActive} />
          </div>
        ))}
        {codes.length === 0 ? <p className="text-sm text-aio-silver">No promo codes yet.</p> : null}
      </div>
    </div>
  );
}
