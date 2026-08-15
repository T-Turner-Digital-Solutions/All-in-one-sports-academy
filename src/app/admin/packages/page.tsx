import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { CreatePackageForm, TogglePackageButton } from "./PackageForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packages" };

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Packages</h1>
        <p className="mt-1 text-xs text-aio-silver">
          Only the $80/hour training rate is fixed by the business — clients choose how many hours to
          book, and every other package price is fully admin-controlled.
        </p>
      </div>
      <CreatePackageForm />
      <div className="space-y-3">
        {packages.map((p) => (
          <div key={p.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{p.name}</p>
              <p className="text-xs text-aio-silver">
                {p.type.replaceAll("_", " ")} · {formatCents(p.priceCents)} · {p.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <TogglePackageButton packageId={p.id} isActive={p.isActive} />
          </div>
        ))}
      </div>
    </div>
  );
}
