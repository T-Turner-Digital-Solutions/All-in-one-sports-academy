import { Container, SectionHeading } from "@/components/ui/Container";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Get In Touch" title="Contact All In One Sports Academy" light />
          <p className="mt-6 text-aio-silver-light/80">
            Questions about training, camps, or coaching opportunities? Send us a message and the
            Academy team will get back to you.
          </p>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
