import { prisma } from "@/lib/prisma";
import { CreateSportForm, TogglePublishButton, DeleteSportButton } from "./SportControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sports" };

export default async function AdminSportsPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { coaches: true, appointments: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Sports</h1>
        <p className="mt-1 text-aio-silver">
          Sports are fully admin-configurable — add, publish, hide, or remove any sport without a code
          change.
        </p>
      </div>
      <CreateSportForm />
      <div className="space-y-3">
        {sports.map((s) => (
          <div key={s.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{s.name}</p>
              <p className="text-xs text-aio-silver">
                {s._count.coaches} coaches · {s._count.appointments} bookings · {s.isPublished ? "Published" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-2">
              <TogglePublishButton sportId={s.id} isPublished={s.isPublished} />
              <DeleteSportButton sportId={s.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
