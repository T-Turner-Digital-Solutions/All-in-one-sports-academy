import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatCents } from "@/lib/format";

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
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Packages"
          title="Training Packages"
          subtitle="All pricing is set and controlled by Academy admin. Only the $80 single session price is fixed today — additional packages appear here as Justin adds them."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
