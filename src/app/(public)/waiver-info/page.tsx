import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "Liability & Participation Waiver" };

export default function WaiverInfoPage() {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Required Before Training" title="Liability & Participation Waiver Information" />
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-aio-silver-light/90">
          <p>
            Before an athlete&apos;s first training session, a parent or guardian (or the adult athlete) must
            electronically complete the following All In One Sports Academy waivers and consents:
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>Participation Waiver</li>
            <li>Liability Release</li>
            <li>Parent/Guardian Consent (for minors)</li>
            <li>Medical Acknowledgment</li>
            <li>Photo/Video Release (optional)</li>
          </ul>
          <p>
            Each waiver captures the signer&apos;s name, an electronic signature, the date and time of
            signing, the agreement version, and device metadata for our records. Waiver status is shown
            next to each athlete&apos;s profile in your client dashboard, and unsigned waivers will block
            new bookings for that athlete until completed.
          </p>
          <p>
            Waivers can be completed from your client dashboard after creating an account and adding an
            athlete profile.
          </p>
        </div>
      </Container>
    </section>
  );
}
