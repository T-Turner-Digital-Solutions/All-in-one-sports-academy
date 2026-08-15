import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

// force-dynamic (not ISR): this page queries the database, and the
// production build environment has no DB access — only the running
// server does. Static/ISR rendering would fail `next build` outright.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sport = await prisma.sport.findUnique({ where: { slug } });
  return { title: sport?.name ?? "Sport" };
}

export default async function SportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sport = await prisma.sport.findUnique({
    where: { slug },
    include: {
      coaches: { include: { coach: { include: { user: true } } } },
      trainingPrograms: { where: { isPublished: true } },
    },
  });

  if (!sport || !sport.isPublished) notFound();

  return (
    <>
      {sport.imageUrl ? (
        <div className="relative h-64 w-full overflow-hidden border-b border-white/10 sm:h-80">
          <Image src={sport.imageUrl} alt={sport.name} fill priority sizes="100vw" className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-aio-black via-aio-black/30 to-transparent" />
          {sport.slug === "soccer" ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="-rotate-6 border-y-4 border-aio-red bg-aio-black px-6 py-3 text-center font-display text-3xl font-bold uppercase tracking-widest text-aio-red sm:text-4xl">
                Coming Soon
              </span>
            </div>
          ) : null}
          <Container className="relative flex h-full flex-col justify-end pb-8">
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">SPORT</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">{sport.name}</h1>
          </Container>
        </div>
      ) : null}

      <section className="py-20">
        <Container>
          {!sport.imageUrl ? (
            <>
              <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">SPORT</p>
              <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{sport.name}</h1>
            </>
          ) : null}
          <p className="mt-4 max-w-2xl text-aio-silver-light/90">{sport.description}</p>
          <ButtonLink href={`/book?sport=${sport.id}`} className="mt-8">
            Book {sport.name} Training — $80/hr
          </ButtonLink>

          {sport.trainingPrograms.length > 0 ? (
            <div className="mt-16">
              <SectionHeading eyebrow="Programs" title={`${sport.name} Training Options`} light />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sport.trainingPrograms.map((p) => (
                  <div key={p.id} className="aio-card p-5">
                    <p className="font-display font-bold">{p.name}</p>
                    <p className="mt-2 text-sm text-aio-silver">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-16">
            <SectionHeading eyebrow="Coaches" title={`${sport.name} Coaches`} light />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sport.coaches.length === 0 ? (
                <p className="text-aio-silver">Coaches for this sport will be listed here once assigned.</p>
              ) : (
                sport.coaches.map((cs) => (
                  <div key={cs.id} className="aio-card p-5">
                    <p className="font-display font-bold">
                      {cs.coach.user.firstName} {cs.coach.user.lastName}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-aio-silver">{cs.coach.bio}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
