import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { CreateGiftForm } from "./GiftForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Certificates" };

export default async function AdminGiftCertificatesPage() {
  const certs = await prisma.giftCertificate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Gift Certificates</h1>
      <CreateGiftForm />
      <div className="space-y-3">
        {certs.map((c) => (
          <div key={c.id} className="aio-card p-4">
            <p className="font-display font-bold">{c.code}</p>
            <p className="text-xs text-aio-silver">
              {formatCents(c.remainingValueCents)} remaining of {formatCents(c.initialValueCents)} · {c.isActive ? "Active" : "Disabled"}
            </p>
          </div>
        ))}
        {certs.length === 0 ? <p className="text-sm text-aio-silver">No gift certificates yet.</p> : null}
      </div>
    </div>
  );
}
