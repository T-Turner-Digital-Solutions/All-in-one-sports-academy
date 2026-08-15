import Stripe from "stripe";

/**
 * Stripe is the payment architecture for the booking engine. STRIPE_SECRET_KEY
 * is not configured in this environment — set it (and STRIPE_WEBHOOK_SECRET)
 * in production for live payments. Until then, isStripeConfigured() is false
 * and the booking flow uses a clearly-labeled manual/dev payment fallback so
 * the rest of the system (holds, conflict prevention, confirmations) can be
 * exercised end-to-end.
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it to your environment to enable live payments."
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}
