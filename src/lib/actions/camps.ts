"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { finalizeSuccessfulPayment } from "@/lib/payments";
import { isStripeConfigured, getStripe } from "@/lib/stripe";

export type CampRegisterState = { error?: string; success?: boolean; clientSecret?: string; devMode?: boolean };

const schema = z.object({ campId: z.string().min(1), athleteId: z.string().min(1) });

export async function registerForCampAction(_prev: CampRegisterState, formData: FormData): Promise<CampRegisterState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT" || !session.user.householdId) {
    return { error: "Please log in to your client account to register." };
  }

  const parsed = schema.safeParse({ campId: formData.get("campId"), athleteId: formData.get("athleteId") });
  if (!parsed.success) return { error: "Please select an athlete." };

  const [camp, athlete] = await Promise.all([
    prisma.camp.findUnique({ where: { id: parsed.data.campId }, include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } } }),
    prisma.athlete.findUnique({ where: { id: parsed.data.athleteId } }),
  ]);
  if (!camp || !camp.isPublished) return { error: "Camp not found." };
  if (!athlete || athlete.householdId !== session.user.householdId) return { error: "Athlete not found." };
  if (camp.registrationDeadline && new Date() > camp.registrationDeadline) return { error: "Registration is closed for this camp." };
  if (camp._count.registrations >= camp.maxParticipants) return { error: "This camp is full." };

  const registration = await prisma.campRegistration.create({
    data: { campId: camp.id, athleteId: athlete.id, status: "PENDING_PAYMENT" },
  });

  const payment = await prisma.payment.create({
    data: {
      campRegistrationId: registration.id,
      householdId: session.user.householdId,
      amountCents: camp.priceCents,
      status: "PENDING",
    },
  });

  if (isStripeConfigured()) {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: camp.priceCents,
      currency: "usd",
      metadata: { campRegistrationId: registration.id, paymentId: payment.id },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { stripePaymentIntentId: intent.id } });
    return { clientSecret: intent.client_secret ?? undefined };
  }

  await finalizeSuccessfulPayment(payment.id);
  return { success: true, devMode: true };
}
