"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createHold,
  SlotUnavailableError,
  getSinglSessionPriceCents,
  MIN_SESSION_HOURS,
  MAX_SESSION_HOURS,
  SESSION_LENGTH_MINUTES,
} from "@/lib/booking";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { CURRENT_POLICY_VERSION, POLICY_ACCEPTANCE_TEXT } from "@/lib/policy";
import { finalizeSuccessfulPayment } from "@/lib/payments";
import { headers } from "next/headers";

const holdSchema = z.object({
  athleteId: z.string().min(1),
  sportId: z.string().min(1),
  trainingProgramId: z.string().optional(),
  coachId: z.string().min(1),
  startsAt: z.string().min(1),
  hours: z.coerce.number().int().min(MIN_SESSION_HOURS).max(MAX_SESSION_HOURS),
});

export type HoldState = {
  error?: string;
  appointmentId?: string;
  holdExpiresAt?: string;
};

export async function createHoldAction(_prev: HoldState, formData: FormData): Promise<HoldState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return { error: "Please log in to your client account to book training." };
  }

  const parsed = holdSchema.safeParse({
    athleteId: formData.get("athleteId"),
    sportId: formData.get("sportId"),
    trainingProgramId: formData.get("trainingProgramId") || undefined,
    coachId: formData.get("coachId"),
    startsAt: formData.get("startsAt"),
    hours: formData.get("hours"),
  });
  if (!parsed.success) return { error: "Please complete every step before continuing." };

  const { athleteId, sportId, trainingProgramId, coachId, startsAt, hours } = parsed.data;

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete || athlete.householdId !== session.user.householdId) {
    return { error: "That athlete doesn't belong to your account." };
  }

  const qualified = await prisma.coachSport.findUnique({
    where: { coachId_sportId: { coachId, sportId } },
  });
  if (!qualified) return { error: "That coach isn't qualified for the selected sport." };

  const pricePerHourCents = await getSinglSessionPriceCents();
  const priceCents = pricePerHourCents * hours;

  try {
    const appointment = await createHold({
      athleteId,
      householdId: session.user.householdId!,
      coachId,
      sportId,
      trainingProgramId,
      startsAt: new Date(startsAt),
      durationMinutes: hours * SESSION_LENGTH_MINUTES,
      priceCents,
      source: "PUBLIC_BOOKING",
    });
    return { appointmentId: appointment.id, holdExpiresAt: appointment.holdExpiresAt?.toISOString() };
  } catch (err) {
    if (err instanceof SlotUnavailableError) return { error: err.message };
    console.error(err);
    return { error: "Something went wrong holding that slot. Please try again." };
  }
}

export type CheckoutState = {
  error?: string;
  success?: boolean;
  clientSecret?: string;
  devMode?: boolean;
};

export async function completeCheckoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const session = await auth();
  if (!session) return { error: "Please log in to complete checkout." };

  const appointmentId = formData.get("appointmentId");
  const agreed = formData.get("policyAgreement");
  if (typeof appointmentId !== "string" || !appointmentId) {
    return { error: "Missing appointment." };
  }
  if (agreed !== "true") {
    return { error: `You must agree: "${POLICY_ACCEPTANCE_TEXT}"` };
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.householdId !== session.user.householdId) {
    return { error: "Appointment not found." };
  }
  if (appointment.status !== "HELD") {
    return { error: "This appointment is no longer held. Please start a new booking." };
  }
  if (appointment.holdExpiresAt && appointment.holdExpiresAt < new Date()) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CLIENT_CANCELLED", cancellationReason: "Hold expired." },
    });
    return { error: "Your hold on this time slot expired. Please select a new time." };
  }

  const headersList = await headers();

  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      householdId: appointment.householdId,
      amountCents: appointment.priceCents,
      status: "PENDING",
    },
  });

  await prisma.paymentPolicyAcceptance.create({
    data: {
      paymentId: payment.id,
      userId: session.user.id,
      policyVersion: CURRENT_POLICY_VERSION,
      ipAddress: headersList.get("x-forwarded-for") ?? undefined,
      userAgent: headersList.get("user-agent") ?? undefined,
    },
  });

  if (isStripeConfigured()) {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: appointment.priceCents,
      currency: "usd",
      metadata: { appointmentId: appointment.id, paymentId: payment.id },
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripePaymentIntentId: intent.id },
    });
    return { clientSecret: intent.client_secret ?? undefined };
  }

  // Development fallback: Stripe is not configured in this environment.
  // Payment is marked succeeded immediately so the rest of the booking
  // pipeline (confirmation, attendance, notifications) can be exercised.
  await finalizeSuccessfulPayment(payment.id);

  return { success: true, devMode: true };
}
