import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Terms of Service" />
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-aio-silver-light/90">
          <p>
            By creating an account, booking training, registering for a camp or clinic, or applying to
            coach with All In One Sports Academy, you agree to these Terms of Service along with our{" "}
            <a href="/cancellation-policy" className="text-aio-red hover:underline">
              Cancellation &amp; Rescheduling Policy
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-aio-red hover:underline">
              Privacy Policy
            </a>
            .
          </p>
          <p>
            Appointments are not confirmed until payment succeeds. All payments are final and
            nonrefundable, subject to the credit-transfer provisions described in our Cancellation &amp;
            Rescheduling Policy.
          </p>
          <p>
            Participation in training, camps, and clinics requires a completed Liability &amp;
            Participation Waiver for each athlete, as described on our Waiver Information page.
          </p>
          <p>
            Coaches operate as independent contractors under a separate Independent Contractor
            Agreement executed during the approval process. Approval to coach is at the sole discretion
            of Academy ownership and may be suspended or revoked for violations of Academy policy.
          </p>
          <p>
            Accounts, athlete data, and coach records may only be accessed by authorized users as
            defined by our role-based access controls. Misuse of the platform, including attempting to
            access data outside your authorized role, may result in account suspension.
          </p>
        </div>
      </Container>
    </section>
  );
}
