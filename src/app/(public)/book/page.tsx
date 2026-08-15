import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { getSinglSessionPriceCents } from "@/lib/booking";
import { isStripeConfigured } from "@/lib/stripe";
import { BookingWizard } from "./BookingWizard";

export const metadata = { title: "Book Training" };
export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; coach?: string }>;
}) {
  const { sport, coach } = await searchParams;
  const session = await auth();

  const [sports, trainingPrograms, athletes, pricePerHourCents] = await Promise.all([
    prisma.sport.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.trainingProgram.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    session?.user.role === "CLIENT" && session.user.householdId
      ? prisma.athlete.findMany({ where: { householdId: session.user.householdId, isActive: true } })
      : Promise.resolve([]),
    getSinglSessionPriceCents(),
  ]);

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow="Book Training"
          title="Book Your Session"
          subtitle="Appointments are not confirmed until payment succeeds — your slot is held for a short window while you complete checkout."
          light
        />
        <div className="mt-12">
          <BookingWizard
            sports={sports.map((s) => ({ id: s.id, name: s.name, slug: s.slug }))}
            trainingPrograms={trainingPrograms.map((p) => ({ id: p.id, name: p.name, sportId: p.sportId }))}
            athletes={athletes.map((a) => ({
              id: a.id,
              firstName: a.firstName,
              lastName: a.lastName,
              dob: a.dob.toISOString(),
            }))}
            loggedIn={Boolean(session && session.user.role === "CLIENT")}
            pricePerHourCents={pricePerHourCents}
            isStripeConfigured={isStripeConfigured()}
            initialSportId={sport}
            initialCoachId={coach}
          />
        </div>
      </Container>
    </section>
  );
}
