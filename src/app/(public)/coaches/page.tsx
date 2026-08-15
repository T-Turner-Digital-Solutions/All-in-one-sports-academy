import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Coaches" };
export const revalidate = 60;

export default async function CoachesPage() {
  const coaches = await prisma.coach.findMany({
    where: { status: "ACTIVE", isPubliclyListed: true },
    include: { user: true, sports: { include: { sport: true } } },
  });

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Coaching Staff"
          title="Every Coach. Vetted & Certified."
          subtitle="Every coach on this page has completed the AIO contractor application and been approved by Justin Woodall before working with athletes."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Link key={coach.id} href={`/coaches/${coach.id}`} className="aio-card block p-6 transition-transform hover:-translate-y-1">
              <p className="font-display text-xl font-bold">
                {coach.user.firstName} {coach.user.lastName}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-aio-silver">{coach.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {coach.sports.map((cs) => (
                  <span key={cs.id} className="border border-aio-red/40 px-2 py-1 text-xs uppercase text-aio-red">
                    {cs.sport.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
