import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Container";
import { formatCents } from "@/lib/format";
import { ArrowRight, ShieldCheck, Trophy, Users, Zap } from "lucide-react";

export default async function HomePage() {
  const [sports, coaches, singleSession, reviews] = await Promise.all([
    prisma.sport.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.coach.findMany({
      where: { status: "ACTIVE", isPubliclyListed: true },
      include: { user: true, sports: { include: { sport: true } } },
      take: 3,
    }),
    prisma.package.findFirst({ where: { type: "SINGLE_SESSION", isActive: true } }),
    prisma.review.findMany({ where: { isApprovedPublic: true }, include: { user: true }, take: 3 }),
  ]);

  const priceLabel = singleSession ? formatCents(singleSession.priceCents) : "$80";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-aio-black">
        <div className="aio-speed-lines" />
        <div className="aio-wind-glow aio-gradient-red aio-animate-drift h-[420px] w-[420px] -left-32 -top-32" />
        <div className="aio-wind-glow aio-gradient-silver h-[360px] w-[360px] right-[-120px] top-40" />
        <Container className="relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.35em] text-aio-red">
              MULTI-SPORT ATHLETIC TRAINING ACADEMY
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] sm:text-7xl">
              <span className="aio-metallic-text">ONE ACADEMY.</span>
              <br />
              <span className="text-aio-white">EVERY SPORT.</span>
              <br />
              <span className="text-aio-red aio-underline">ENDLESS POSSIBILITIES.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-aio-silver-light/90">
              Professional coaching for youth and competitive athletes across football, basketball,
              baseball, softball, soccer, and specialized athletic development. Train. Develop. Compete.
              Succeed.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/book" size="lg">
                Book Training — {priceLabel}
              </ButtonLink>
              <ButtonLink href="/sports" variant="outline" size="lg">
                Explore Sports <ArrowRight size={18} />
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Image
              src="/brand/aio-hero.png"
              alt="All In One Sports Academy — football, basketball, baseball, soccer, and more"
              width={1200}
              height={1200}
              className="w-full drop-shadow-[0_0_60px_rgba(224,18,24,0.25)]"
              priority
            />
          </div>
        </Container>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-white/10 bg-aio-charcoal">
        <Container className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {[
            { icon: Trophy, label: "Sports Offered", value: `${sports.length || 9}+` },
            { icon: Users, label: "Athletes Coached", value: "500+" },
            { icon: Zap, label: "Per Session", value: priceLabel },
            { icon: ShieldCheck, label: "Certified Coaches", value: "100%" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <s.icon className="text-aio-red" size={28} />
              <div>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-aio-silver">{s.label}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* SPORTS GRID */}
      <section className="bg-aio-white py-20 text-aio-black">
        <Container>
          <SectionHeading
            eyebrow="Training"
            title="Every Sport. One Academy."
            subtitle="Justin can add new sports and programs any time — nothing here is hard-coded to a single sport."
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sports.length === 0 ? (
              <p className="text-aio-charcoal-2/70">Sports will appear here once added in the admin portal.</p>
            ) : (
              sports.map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.slug}`}
                  className="group relative flex h-32 items-end overflow-hidden border border-black/10 bg-aio-black p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="aio-wind-glow aio-gradient-red h-32 w-32 -right-10 -top-10 opacity-20 transition-opacity group-hover:opacity-40" />
                  <span className="relative font-display text-lg font-bold text-white group-hover:text-aio-red">
                    {sport.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* COACHES TEASER */}
      <section className="bg-aio-black py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Coaching Staff" title="Train With Proven Coaches" light />
            <ButtonLink href="/coaches" variant="outline">
              View All Coaches
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.length === 0 ? (
              <p className="text-aio-silver">Coach profiles will appear here once approved by the admin.</p>
            ) : (
              coaches.map((coach) => (
                <div key={coach.id} className="aio-card p-6">
                  <p className="font-display text-xl font-bold">
                    {coach.user.firstName} {coach.user.lastName}
                  </p>
                  <p className="mt-2 text-sm text-aio-silver">{coach.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {coach.sports.map((cs) => (
                      <span key={cs.id} className="border border-aio-red/40 px-2 py-1 text-xs uppercase text-aio-red">
                        {cs.sport.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </section>

      {reviews.length > 0 ? (
        <section className="bg-aio-charcoal py-20">
          <Container>
            <SectionHeading eyebrow="Results" title="Athlete Success Stories" light align="center" />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} className="aio-card p-6">
                  <p className="text-aio-silver-light/90">&ldquo;{r.feedback}&rdquo;</p>
                  <p className="mt-4 font-display text-sm text-aio-red">
                    {r.user.firstName} {r.user.lastName.charAt(0)}.
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* CTA BANNER */}
      <section className="relative overflow-hidden bg-aio-red py-16">
        <div className="aio-speed-lines opacity-30" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            Ready to train like a pro? Book your session today.
          </h2>
          <ButtonLink href="/book" variant="secondary" size="lg">
            Book Training — {priceLabel}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
