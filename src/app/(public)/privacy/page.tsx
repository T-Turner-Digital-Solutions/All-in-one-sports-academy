import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" />
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-aio-silver-light/90">
          <p>Last updated: {new Date().getFullYear()}</p>
          <p>
            All In One Sports Academy (&ldquo;the Academy,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects
            information you provide directly, including account details, athlete profiles, medical and
            emergency contact information relevant to participation, booking and payment records,
            coach applications and supporting documents, and communications with our team.
          </p>
          <p>
            We use this information to operate the training academy: scheduling and delivering
            sessions, processing payments, managing waitlists and rosters, evaluating and tracking
            athlete progress, communicating reminders and updates, and reviewing contractor
            applications.
          </p>
          <p>
            Sensitive athlete information (medical notes, injuries/restrictions, coach evaluations, and
            internal coach notes) is restricted to the athlete&apos;s household, their assigned coach(es),
            and Academy administrators, and is never sold or shared with third parties for marketing
            purposes.
          </p>
          <p>
            Payment processing is handled by our payment processor; we do not store full payment card
            numbers on our servers. Access to organization data is controlled by role-based permissions
            enforced on every request, not solely by hidden navigation.
          </p>
          <p>
            Questions about this policy or your data can be sent through our{" "}
            <a href="/contact" className="text-aio-red hover:underline">
              Contact page
            </a>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
