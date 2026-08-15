import { Container, SectionHeading } from "@/components/ui/Container";

export const metadata = { title: "FAQs" };

const FAQS = [
  {
    q: "How much does a private training session cost?",
    a: "Standard private training sessions are $80 per session. Packages and group/camp pricing are set by Academy admin and shown on the Packages and Camps & Clinics pages.",
  },
  {
    q: "How do I book a session?",
    a: "Use the Book Training button anywhere on the site. You'll select an athlete, sport, training type, coach, and available time, review the details, agree to our policy, and pay to confirm.",
  },
  {
    q: "Is my appointment confirmed before I pay?",
    a: "No. Your slot is held for a short window while you complete checkout, but the appointment is only confirmed once payment succeeds.",
  },
  {
    q: "Can I reschedule my session?",
    a: "Yes, up to 72 hours (3 days) before your appointment, from your client dashboard, the appointment page, or directly from your confirmation or reminder email. Inside 72 hours, rescheduling is disabled unless the Academy grants an override.",
  },
  {
    q: "Are payments refundable?",
    a: "All payments are final and nonrefundable. If All In One Sports Academy or your coach cancels a session, your payment is converted into a training credit toward a future appointment.",
  },
  {
    q: "What if my preferred coach isn't available?",
    a: "You'll be shown other coaches who are qualified for your sport and available at your desired time, or you can join a waitlist for your preferred coach.",
  },
  {
    q: "How does the waitlist work?",
    a: "If a slot opens up, it's offered to the next person on the waitlist for exactly 15 minutes. If they don't claim and pay in that window, the offer automatically moves to the next person.",
  },
  {
    q: "Can I train with All In One Sports Academy as a coach?",
    a: "Yes — visit the Join the AIO Coaching Team page to submit an application. Approval by Justin Woodall is required before you gain access to the coach portal or any client information.",
  },
];

export default function FaqsPage() {
  return (
    <section className="py-20">
      <Container className="max-w-4xl">
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" />
        <div className="mt-10 divide-y divide-white/10 border-t border-b border-white/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold">
                {f.q}
                <span className="ml-4 text-aio-red transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-aio-silver-light/80">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
