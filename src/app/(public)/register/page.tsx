import { Container } from "@/components/ui/Container";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create an Account" };

export default function RegisterPage() {
  return (
    <section className="py-20">
      <Container>
        <RegisterForm />
      </Container>
    </section>
  );
}
