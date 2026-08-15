import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

// force-dynamic (not ISR): this page queries the database, and the
// production build environment has no DB access — only the running
// server does. Static/ISR rendering would fail `next build` outright.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coach = await prisma.coach.findUnique({ where: { id }, include: { user: true } });
  return { title: coach ? `${coach.user.firstName} ${coach.user.lastName}` : "Coach" };
}

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coach = await prisma.coach.findUnique({
    where: { id },
    include: {
      user: true,
      sports: { include: { sport: true } },
      locations: { include: { location: true } },
      availability: { where: { isActive: true } },
    },
  });

  if (!coach || coach.status !== "ACTIVE" || !coach.isPubliclyListed) notFound();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <section className="py-20">
      <Container>
        <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">COACH</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          {coach.user.firstName} {coach.user.lastName}
        </h1>
        <p className="mt-4 max-w-2xl text-aio-silver-light/90">{coach.bio}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {coach.sports.map((cs) => (
            <span key={cs.id} className="border border-aio-red/40 px-2 py-1 text-xs uppercase text-aio-red">
              {cs.sport.name}
            </span>
          ))}
        </div>

        <ButtonLink href={`/book?coach=${coach.id}`} className="mt-8">
          Book with {coach.user.firstName} — $80/hr
        </ButtonLink>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="font-display text-lg font-bold">Weekly Availability</p>
            <ul className="mt-4 space-y-2 text-sm text-aio-silver">
              {coach.availability
                .filter((a) => a.type === "RECURRING" && a.dayOfWeek !== null)
                .map((a) => (
                  <li key={a.id}>
                    {dayNames[a.dayOfWeek!]}: {a.startTime} – {a.endTime}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-lg font-bold">Training Locations</p>
            <ul className="mt-4 space-y-2 text-sm text-aio-silver">
              {coach.locations.map((cl) => (
                <li key={cl.id}>{cl.location.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
