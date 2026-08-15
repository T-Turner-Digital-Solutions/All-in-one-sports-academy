import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizeSuccessfulPayment } from "@/lib/payments";
import type Stripe from "stripe";

/**
 * Stripe webhook. Requires STRIPE_WEBHOOK_SECRET to be configured — until
 * then this route responds 501 so misconfiguration fails loudly instead of
 * silently accepting unverified events.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe is not configured on this server." },
      { status: 501 }
    );
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const payment = await prisma.payment.findUnique({ where: { stripePaymentIntentId: intent.id } });
    if (payment) await finalizeSuccessfulPayment(payment.id);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: "FAILED", failureReason: intent.last_payment_error?.message ?? "Payment failed" },
    });
  }

  return NextResponse.json({ received: true });
}
