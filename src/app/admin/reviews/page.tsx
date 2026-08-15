import { prisma } from "@/lib/prisma";
import { ApproveButton } from "./ApproveButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, appointment: { include: { sport: true, coach: { include: { user: true } } } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Reviews</h1>
      <p className="mt-1 text-aio-silver">Feedback stays private until you approve it for public display.</p>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="aio-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold">
                  {r.user.firstName} {r.user.lastName} — {r.rating}/5
                </p>
                <p className="text-xs text-aio-silver">
                  {r.appointment.sport.name} with Coach {r.appointment.coach.user.firstName}
                </p>
              </div>
              <ApproveButton reviewId={r.id} approved={r.isApprovedPublic} />
            </div>
            {r.feedback ? <p className="mt-2 text-sm text-aio-silver-light/90">&ldquo;{r.feedback}&rdquo;</p> : null}
          </div>
        ))}
        {reviews.length === 0 ? <p className="text-sm text-aio-silver">No reviews yet.</p> : null}
      </div>
    </div>
  );
}
