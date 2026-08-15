import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Target, Users, TrendingUp, Award } from "lucide-react";

export const metadata = { title: "About Us" };

const VALUES = [
  { icon: Target, title: "Development-First", body: "Every athlete follows a plan built around their goals, not a one-size-fits-all curriculum." },
  { icon: Users, title: "Multi-Sport Expertise", body: "Coaches across football, basketball, baseball, softball, soccer, and specialized training." },
  { icon: TrendingUp, title: "Tracked Progress", body: "Evaluations and measurements let athletes and parents see real, measurable improvement." },
  { icon: Award, title: "Professional Standards", body: "Every coach is vetted, background-checked, and certified before working with athletes." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-aio-black py-24">
        <div className="aio-speed-lines" />
        <Container className="relative">
          <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">ABOUT THE ACADEMY</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold">
            Built by an athlete, <span className="text-aio-red">for athletes.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-aio-silver-light/90">
            All In One Sports Academy was founded by Justin Woodall to give athletes of every sport,
            age, and skill level access to the same professional-level coaching, structure, and
            accountability that elite programs use. One academy, every sport — built to grow with
            every athlete who walks through the door.
          </p>
        </Container>
      </section>

      <section className="bg-aio-white py-20 text-aio-black">
        <Container>
          <SectionHeading eyebrow="Our Approach" title="Train. Develop. Compete. Succeed." align="center" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="border border-black/10 p-6">
                <v.icon className="text-aio-red" size={28} />
                <p className="mt-4 font-display text-lg font-bold">{v.title}</p>
                <p className="mt-2 text-sm text-aio-charcoal-2/80">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-aio-black py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Founder" title="Meet Justin Woodall" light />
            <p className="mt-6 text-aio-silver-light/90">
              Justin founded All In One Sports Academy to solve a simple problem: athletes shouldn&apos;t
              have to bounce between disconnected trainers to build real, well-rounded athleticism.
              As Owner and Super Admin of the academy, Justin oversees every coach, program, and
              policy — while personally training athletes across multiple sports.
            </p>
            <div className="mt-8 flex gap-4">
              <ButtonLink href="/coaches">Meet the Coaching Staff</ButtonLink>
              <ButtonLink href="/book" variant="outline">
                Book a Session
              </ButtonLink>
            </div>
          </div>
          <div className="aio-card relative h-72 overflow-hidden">
            <div className="aio-wind-glow aio-gradient-red aio-animate-drift h-64 w-64 -left-16 top-10" />
            <div className="relative flex h-full items-center justify-center">
              <p className="font-display text-2xl font-bold text-aio-silver">JUSTIN WOODALL</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
