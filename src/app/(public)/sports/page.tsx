import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Sports" };
export const revalidate = 60;

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
              className="group aio-card relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
            >
              <div className="aio-wind-glow aio-gradient-red h-28 w-28 -right-8 -top-8 opacity-20 transition-opacity group-hover:opacity-40" />
              <p className="relative font-display text-xl font-bold group-hover:text-aio-red">{sport.name}</p>
              <p className="relative mt-2 text-sm text-aio-silver">{sport.description}</p>
              <p className="relative mt-4 text-xs uppercase tracking-widest text-aio-silver/60">
                {sport._count.coaches} coach{sport._count.coaches === 1 ? "" : "es"}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
