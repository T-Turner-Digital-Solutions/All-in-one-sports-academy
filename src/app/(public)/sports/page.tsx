import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Sports" };
// force-dynamic (not ISR): this page queries the database, and the
// production build environment has no DB access — only the running
// server does. Static/ISR rendering would fail `next build` outright.
export const dynamic = "force-dynamic";

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { coaches: true } } },
  });

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Sports"
          title="Every Sport. One Academy."
          subtitle="Justin and the AIO coaching staff train athletes across every sport below — and this list grows as new sports and coaches join the academy."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              href={`/sports/${sport.slug}`}
              className="group aio-card overflow-hidden transition-transform hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden bg-aio-black">
                {sport.imageUrl ? (
                  <Image
                    src={sport.imageUrl}
                    alt={sport.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="aio-wind-glow aio-gradient-red h-28 w-28 -right-8 -top-8 opacity-20 transition-opacity group-hover:opacity-40" />
                )}
                {sport.slug === "soccer" ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                    <span className="-rotate-6 border-y-2 border-aio-red bg-aio-black px-4 py-2 text-center font-display text-xl font-bold uppercase tracking-widest text-aio-red sm:text-2xl">
                      Coming Soon
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="p-6">
                <p className="font-display text-xl font-bold text-aio-white group-hover:text-aio-red">{sport.name}</p>
                <p className="mt-2 line-clamp-2 text-sm text-aio-silver">{sport.description}</p>
                <p className="mt-3 text-xs uppercase tracking-widest text-aio-silver/60">
                  {sport._count.coaches} coach{sport._count.coaches === 1 ? "" : "es"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
