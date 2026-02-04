import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

export function getStripe() {
  if (cachedStripe) return cachedStripe;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY env var");
  }

  cachedStripe = new Stripe(apiKey);
  return cachedStripe;
}
