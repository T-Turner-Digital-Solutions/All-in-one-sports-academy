import { prisma } from "@/lib/prisma";
import { formatCents, formatDateTime } from "@/lib/format";
import { CreateCampForm, TogglePublishButton } from "./CampForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Camps & Clinics" };

export default async function AdminCampsPage() {
  const [camps, sports, locations] = await Promise.all([
    prisma.camp.findMany({ orderBy: { startsAt: "desc" }, include: { sport: true, _count: { select: { registrations: true } } } }),
    prisma.sport.findMany({ where: { isPublished: true } }),
    prisma.location.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Camps & Clinics</h1>
      <CreateCampForm sports={sports.map((s) => ({ id: s.id, label: s.name }))} locations={locations.map((l) => ({ id: l.id, label: l.name }))} />
      <div className="space-y-3">
        {camps.map((c) => (
          <div key={c.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{c.name}</p>
              <p className="text-xs text-aio-silver">
                {formatDateTime(c.startsAt)} · {formatCents(c.priceCents)} · {c._count.registrations}/{c.maxParticipants} registered ·{" "}
                {c.isPublished ? "Published" : "Hidden"}
              </p>
            </div>
            <TogglePublishButton campId={c.id} isPublished={c.isPublished} />
          </div>
        ))}
      </div>
    </div>
  );
}
