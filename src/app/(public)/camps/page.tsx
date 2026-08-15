import { prisma } from "@/lib/prisma";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatCents, formatDateTime } from "@/lib/format";

export const metadata = { title: "Camps & Clinics" };
export const revalidate = 30;

export default async function CampsPage() {
  const camps = await prisma.camp.findMany({
    where: { isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: {
      sport: true,
      location: true,
      coaches: { include: { coach: { include: { user: true } } } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Camps & Clinics"
          title="Group Training Events"
          subtitle="Registration closes automatically once a camp reaches capacity or its registration deadline passes."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {camps.length === 0 ? (
            <p className="text-aio-silver">No upcoming camps are scheduled right now. Check back soon.</p>
          ) : (
            camps.map((camp) => {
              const remaining = camp.maxParticipants - camp._count.registrations;
              const closed =
                remaining <= 0 || (camp.registrationDeadline ? new Date() > camp.registrationDeadline : false);
              return (
                <div key={camp.id} className="aio-card p-6">
                  {camp.sport ? (
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
                      {camp.sport.name}
                    </p>
                  ) : null}
                  <p className="mt-1 font-display text-2xl font-bold">{camp.name}</p>
                  <p className="mt-2 text-sm text-aio-silver">{camp.description}</p>
                  <dl className="mt-4 space-y-1 text-sm text-aio-silver-light/80">
                    <div className="flex justify-between">
                      <dt>When</dt>
                      <dd>{formatDateTime(camp.startsAt)}</dd>
                    </div>
                    {camp.location ? (
                      <div className="flex justify-between">
                        <dt>Where</dt>
                        <dd>{camp.location.name}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <dt>Price</dt>
                      <dd>{formatCents(camp.priceCents)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Spots Remaining</dt>
                      <dd>{Math.max(remaining, 0)} / {camp.maxParticipants}</dd>
                    </div>
                    {camp.minAge || camp.maxAge ? (
                      <div className="flex justify-between">
                        <dt>Ages</dt>
                        <dd>
                          {camp.minAge ?? "Any"}–{camp.maxAge ?? "Any"}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <ButtonLink
                    href={closed ? "#" : `/camps/${camp.id}/register`}
                    className="mt-6 w-full"
                    variant={closed ? "outline" : "primary"}
                  >
                    {closed ? "Registration Closed" : "Register Now"}
                  </ButtonLink>
                </div>
              );
            })
          )}
        </div>
      </Container>
    </section>
  );
}
