import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export const runtime = "nodejs";

function isActiveSub(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

function unixToIso(sec?: number | null) {
  if (!sec) return null;
  return new Date(sec * 1000).toISOString();
}

function detectPlanFromSub(sub: any) {
  const proPrice = process.env.STRIPE_PRICE_ID_PRO;
  const proPlusPrice = process.env.STRIPE_PRICE_ID_PRO_PLUS;

  const items = sub?.items?.data ?? [];
  const priceId: string | null =
    items?.[0]?.price?.id || items?.[0]?.plan?.id || null;

  if (priceId && proPlusPrice && priceId === proPlusPrice) {
    return { plan: "pro_plus" as const, allowance: 300 };
  }
  if (priceId && proPrice && priceId === proPrice) {
    return { plan: "pro" as const, allowance: 100 };
  }

  // fallback: if metadata.plan exists
  const metaPlan = sub?.metadata?.plan;
  if (metaPlan === "pro_plus") return { plan: "pro_plus" as const, allowance: 300 };
  if (metaPlan === "pro") return { plan: "pro" as const, allowance: 100 };

  return { plan: "free" as const, allowance: 0 };
}

async function upsertCreditsFromSubscription(args: {
  userId: string;
  customerId: string | null;
  sub: any;
  shouldBePro: boolean;
}) {
  const { userId, customerId, sub, shouldBePro } = args;

  const { plan, allowance } = shouldBePro ? detectPlanFromSub(sub) : { plan: "free" as const, allowance: 0 };

  const newStart = shouldBePro ? unixToIso(sub?.current_period_start) : null;
  const newEnd = shouldBePro ? unixToIso(sub?.current_period_end) : null;

  // fetch current to decide if we need to reset paid_used
  const { data: current, error: curErr } = await supabaseAdmin
    .from("user_credits")
    .select("paid_period_end, plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (curErr) {
    // don't fail hard; continue with upsert
    console.warn("user_credits read error:", curErr.message);
  }

  const prevEnd = current?.paid_period_end ?? null;
  const prevPlan = current?.plan ?? "free";
  const shouldResetPaidUsed =
    !!shouldBePro && (!!newEnd && newEnd !== prevEnd || plan !== prevPlan);

  if (!shouldBePro) {
    // downgrade / inactive
    await supabaseAdmin
      .from("user_credits")
      .upsert(
        {
          user_id: userId,
          plan: "free",
          paid_monthly_allowance: 0,
          paid_used: 0,
          paid_period_start: null,
          paid_period_end: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    return;
  }

  await supabaseAdmin
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        plan,
        paid_monthly_allowance: allowance,
        paid_used: shouldResetPaidUsed ? 0 : undefined,
        paid_period_start: newStart,
        paid_period_end: newEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  // If we couldn't set paid_used via upsert undefined trick, do a second update only when needed
  if (shouldResetPaidUsed) {
    await supabaseAdmin
      .from("user_credits")
      .update({ paid_used: 0, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ ok: false, error: "Missing webhook signature/secret" }, { status: 400 });
  }

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

        // Retrieve subscription to read items/periods reliably
        const sub =
          subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] }) : null;

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              stripe_customer_id: customerId ?? undefined,
              stripe_subscription_id: subscriptionId ?? undefined,
            })
            .eq("id", userId);

          if (sub) {
            await upsertCreditsFromSubscription({
              userId,
              customerId,
              sub,
              shouldBePro: isActiveSub(sub.status),
            });
          }
        } else if (customerId) {
          // fallback: acha pelo customerId
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();

          if (prof?.id) {
            await supabaseAdmin
              .from("profiles")
              .update({
                is_pro: true,
                stripe_subscription_id: subscriptionId ?? undefined,
              })
              .eq("id", prof.id);

            if (sub) {
              await upsertCreditsFromSubscription({
                userId: prof.id,
                customerId,
                sub,
                shouldBePro: isActiveSub(sub.status),
              });
            }
          }
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;

        const status = sub.status as string | undefined;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;

        const userIdFromMeta = sub?.metadata?.user_id || null;
        const shouldBePro = event.type === "customer.subscription.deleted" ? false : isActiveSub(status);

        // find userId (prefer subscription metadata, fallback to profiles by customer)
        let userId: string | null = userIdFromMeta;

        if (!userId && customerId) {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          userId = prof?.id ?? null;
        }

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: shouldBePro,
              stripe_customer_id: customerId ?? undefined,
              stripe_subscription_id: sub.id ?? undefined,
            })
            .eq("id", userId);

          await upsertCreditsFromSubscription({
            userId,
            customerId,
            sub,
            shouldBePro,
          });
        } else if (customerId) {
          // last resort: update by customerId
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
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Webhook handler error" }, { status: 500 });
  }
}
