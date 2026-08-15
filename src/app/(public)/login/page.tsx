import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ portal?: string }>;
}) {
  const { portal } = await searchParams;
  const activePortal = portal === "coach" || portal === "admin" ? portal : "client";

  return (
    <section className="py-20">
      <Container>
        <Suspense>
          <LoginForm portal={activePortal} />
        </Suspense>
      </Container>
    </section>
  );
}
