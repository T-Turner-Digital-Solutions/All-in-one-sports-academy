import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatCents } from "@/lib/format";
import { GeneralAvailabilityCalendar } from "@/components/booking/GeneralAvailabilityCalendar";

export const metadata = { title: "Packages" };
// force-dynamic (not ISR): this page queries the database, and the
// production build environment has no DB access — only the running
// server does. Static/ISR rendering would fail `next build` outright.
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  SINGLE_SESSION: "Single Session",
  MULTI_SESSION: "Multi-Session Package",
  MONTHLY: "Monthly Training",
  GROUP: "Group Training",
  CAMP: "Camp",
  TEAM: "Team Training",
  PROMOTIONAL: "Promotional",
};

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { isPublished: true, isActive: true },
    orderBy: { priceCents: "asc" },
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-aio-black py-20">
        <Image
          src="/brand/aio-logo.png"
          alt="All In One Sports Academy"
          width={380}
          height={380}
          unoptimized
          className="aio-fade-sides pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 opacity-10 sm:block"
        />
        <Container className="relative">
          <SectionHeading
            eyebrow="Packages"
            title="Training Packages"
            subtitle="All pricing is set and controlled by Academy admin. Only the $80/hour training rate is fixed today — you choose how many hours to book, and additional packages appear here as Justin adds them."
            light
          />
        </Container>
      </section>

      <section className="border-b border-white/10 py-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Availability"
            title="See What's Open"
            subtitle="A quick look at upcoming availability across the academy. Book to see exact times and pick your coach."
            light
          />
          <GeneralAvailabilityCalendar />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="aio-card flex flex-col p-6">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
                  {TYPE_LABEL[pkg.type] ?? pkg.type}
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{pkg.name}</p>
                <p className="mt-2 flex-1 text-sm text-aio-silver">{pkg.description}</p>
                <p className="mt-6 font-display text-3xl font-bold text-aio-white">{formatCents(pkg.priceCents)}</p>
                {pkg.sessionCount ? (
                  <p className="text-xs uppercase tracking-wide text-aio-silver">
                    {pkg.sessionCount} session{pkg.sessionCount === 1 ? "" : "s"}
                  </p>
                ) : null}
                <ButtonLink href="/book" className="mt-6">
                  Book Now
                </ButtonLink>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
