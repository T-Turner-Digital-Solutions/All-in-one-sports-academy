import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Athlete Success" };
export const revalidate = 60;

export default async function AthleteSuccessPage() {
  const reviews = await prisma.review.findMany({
    where: { isApprovedPublic: true },
    include: { user: true, appointment: { include: { sport: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Results"
          title="Athlete Success Stories"
          subtitle="Every testimonial here was submitted by a client after a completed session and approved by Academy admin before being published."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.length === 0 ? (
            <p className="text-aio-silver">
              Athlete success stories will appear here as clients complete training and share their feedback.
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="aio-card p-6">
                <div className="mb-3 flex gap-1 text-aio-red">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <p className="text-aio-silver-light/90">&ldquo;{r.feedback}&rdquo;</p>
                <p className="mt-4 font-display text-sm text-aio-red">
                  {r.user.firstName} {r.user.lastName.charAt(0)}. — {r.appointment.sport.name}
                </p>
              </div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
