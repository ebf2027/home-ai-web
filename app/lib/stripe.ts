import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Deixe sem apiVersion para usar a versão default do SDK instalado.
});
