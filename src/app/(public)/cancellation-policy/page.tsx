import { Container, SectionHeading } from "@/components/ui/Container";
import { CANCELLATION_POLICY_BODY, CURRENT_POLICY_VERSION } from "@/lib/policy";

export const metadata = { title: "Cancellation & Rescheduling Policy" };

export default function CancellationPolicyPage() {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow={`Policy Version ${CURRENT_POLICY_VERSION}`} title="Cancellation & Rescheduling Policy" />
        <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-aio-silver-light/90">
          {CANCELLATION_POLICY_BODY}
        </div>
      </Container>
    </section>
  );
}
