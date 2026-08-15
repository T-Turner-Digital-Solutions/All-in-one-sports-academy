import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Training Programs" };
// force-dynamic (not ISR): this page queries the database, and the
// production build environment has no DB access — only the running
// server does. Static/ISR rendering would fail `next build` outright.
export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await prisma.trainingProgram.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: { sport: true },
  });

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Training Programs"
          title="Programs Built Around Every Athlete"
          subtitle="From private 1-on-1 sessions to position-specific skills work, every program is coach-led and progress-tracked. Admins can add new programs at any time."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div key={p.id} className="aio-card p-6">
              {p.sport ? (
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
                  {p.sport.name}
                </p>
              ) : (
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
                  All Sports
                </p>
              )}
              <p className="mt-2 font-display text-xl font-bold">{p.name}</p>
              <p className="mt-2 text-sm text-aio-silver">{p.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <ButtonLink href="/book" size="lg">
            Book Training — $80
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
