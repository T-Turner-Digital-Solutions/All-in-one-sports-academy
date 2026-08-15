import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { formatCents, formatDateTime } from "@/lib/format";
import { CampRegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function CampRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const camp = await prisma.camp.findUnique({ where: { id }, include: { sport: true, location: true } });
  if (!camp || !camp.isPublished) notFound();

  const athletes =
    session?.user.role === "CLIENT" && session.user.householdId
      ? await prisma.athlete.findMany({ where: { householdId: session.user.householdId, isActive: true } })
      : [];

  return (
    <section className="py-16">
      <Container className="max-w-xl">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">Camp Registration</p>
        <h1 className="mt-2 text-3xl font-bold">{camp.name}</h1>
        <p className="mt-2 text-aio-silver">
          {formatDateTime(camp.startsAt)} · {formatCents(camp.priceCents)}
          {camp.location ? ` · ${camp.location.name}` : ""}
        </p>

        <div className="mt-8">
          {!session || session.user.role !== "CLIENT" ? (
            <div className="aio-card p-6 text-center">
              <p className="text-aio-silver">Log in to your client account to register.</p>
              <a href={`/login?portal=client&callbackUrl=/camps/${camp.id}/register`} className="mt-4 inline-block text-aio-red hover:underline">
                Log In
              </a>
            </div>
          ) : (
            <CampRegisterForm campId={camp.id} athletes={athletes.map((a) => ({ id: a.id, name: `${a.firstName} ${a.lastName}` }))} />
          )}
        </div>
      </Container>
    </section>
  );
}
