import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export const runtime = "nodejs";

function isActiveSub(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export async function POST(req: Request) {
  const stripe = getStripe(); // ✅ aqui

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ ok: false, error: "Missing webhook signature/secret" }, { status: 400 });
  }

  // App Router: use req.text() para obter o corpo raw do webhook.
  const body = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        const userId = session?.metadata?.user_id || session?.client_reference_id || null;

        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              stripe_customer_id: customerId ?? undefined,
              stripe_subscription_id: subscriptionId ?? undefined,
            })
            .eq("id", userId);
        } else if (customerId) {
          // fallback: acha pelo customerId
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              stripe_subscription_id: subscriptionId ?? undefined,
            })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;

        const status = sub.status as string | undefined;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;

        // Prefer metadata do subscription
        const userId = sub?.metadata?.user_id || null;

        const shouldBePro =
          event.type === "customer.subscription.deleted" ? false : isActiveSub(status);

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: shouldBePro,
              stripe_customer_id: customerId ?? undefined,
              stripe_subscription_id: sub.id ?? undefined,
            })
            .eq("id", userId);
        } else if (customerId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: shouldBePro,
              stripe_subscription_id: sub.id ?? undefined,
            })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      default:
        // ignore
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Webhook handler error" }, { status: 500 });
  }
}
