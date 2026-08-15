import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waitlist" };

export default async function AdminWaitlistPage() {
  const waitlists = await prisma.waitlist.findMany({
    where: { status: "OPEN" },
    include: {
      sport: true,
      coach: { include: { user: true } },
      entries: {
        orderBy: { position: "asc" },
        include: { athlete: true, offers: { orderBy: { offeredAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Waitlist</h1>
      <div className="mt-6 space-y-6">
        {waitlists.length === 0 ? (
          <p className="text-sm text-aio-silver">No open waitlists.</p>
        ) : (
          waitlists.map((w) => (
            <div key={w.id} className="aio-card p-5">
              <p className="font-display font-bold">
                {w.sport.name} {w.coach ? `— Coach ${w.coach.user.firstName} ${w.coach.user.lastName}` : "— Any Coach"}
              </p>
              <p className="text-xs text-aio-silver">
                {w.desiredDate ? `Preferred date: ${w.desiredDate.toDateString()}` : "Flexible date"}
                {w.desiredTimeStart ? ` · ${w.desiredTimeStart}-${w.desiredTimeEnd}` : ""}
              </p>
              <div className="mt-4 space-y-2">
                {w.entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                    <span>
                      #{e.position} — {e.athlete.firstName} {e.athlete.lastName}
                    </span>
                    <span className="text-xs text-aio-silver">
                      {e.offers[0]
                        ? `${e.offers[0].status} ${formatDateTime(e.offers[0].offeredAt)}`
                        : "Not yet offered"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
