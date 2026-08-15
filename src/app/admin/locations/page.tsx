import { prisma } from "@/lib/prisma";
import { CreateLocationForm, ToggleLocationButton } from "./LocationForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Locations" };

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Locations</h1>
        <p className="mt-1 text-aio-silver">The Academy isn&apos;t limited to one facility — add every training location here.</p>
      </div>
      <CreateLocationForm />
      <div className="space-y-3">
        {locations.map((l) => (
          <div key={l.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{l.name}</p>
              <p className="text-xs text-aio-silver">
                {l.address}, {l.city}, {l.state} {l.zip} · {l.hours}
              </p>
            </div>
            <ToggleLocationButton locationId={l.id} isActive={l.isActive} />
          </div>
        ))}
      </div>
    </div>
  );
}
