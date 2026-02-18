import { NextResponse } from "next/server";
import { Buffer } from "buffer";
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

/**
 * Stripe vem movendo current_period_start/end para o item da subscription em alguns casos.
 * Então pegamos do item primeiro e fazemos fallback no subscription.
 */
function getPeriodFromSub(sub: any) {
  const item0 = sub?.items?.data?.[0];

  const startSec: number | null =
    item0?.current_period_start ??
    sub?.current_period_start ??
    null;

  const endSec: number | null =
    item0?.current_period_end ??
    sub?.current_period_end ??
    null;

  return {
    startISO: unixToIso(startSec),
    endISO: unixToIso(endSec),
  };
}

function detectPlanFromSub(sub: any) {
  const proPrice = process.env.STRIPE_PRICE_ID_PRO;
  const proPlusPrice = process.env.STRIPE_PRICE_ID_PRO_PLUS;

  const items = sub?.items?.data ?? [];
  const first = items?.[0];

  const priceId: string | null =
    first?.price?.id ||
    first?.plan?.id ||
    null;

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

async function markEventProcessed(eventId: string) {
  // insere o event.id na tabela stripe_events; se já existir, ignora
  const { error } = await supabaseAdmin.from("stripe_events").insert({ id: eventId });

  if (!error) return true;

  const code = (error as any).code as string | undefined;
  const msg = (error as any).message as string | undefined;

  // 23505 = unique violation (id já existe)
  if (code === "23505") return false;
  if ((msg || "").toLowerCase().includes("duplicate")) return false;

  throw error;
}

async function upsertCreditsFromSubscription(args: {
  userId: string;
  sub: any;
  shouldBePro: boolean;
}) {
  const { userId, sub, shouldBePro } = args;

  const { plan, allowance } = shouldBePro
    ? detectPlanFromSub(sub)
    : { plan: "free" as const, allowance: 0 };

  const { startISO: newStart, endISO: newEnd } = shouldBePro ? getPeriodFromSub(sub) : { startISO: null, endISO: null };

  // fetch current to decide if we need to reset paid_used
  const { data: current, error: curErr } = await supabaseAdmin
    .from("user_credits")
    .select("paid_period_start, paid_period_end, plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (curErr) {
    console.warn("user_credits read error:", curErr.message);
  }

  const prevStart = current?.paid_period_start ?? null;
  const prevEnd = current?.paid_period_end ?? null;
  const prevPlan = current?.plan ?? "free";

  const cycleChanged =
    !!shouldBePro &&
    ((newStart && newStart !== prevStart) || (newEnd && newEnd !== prevEnd) || plan !== prevPlan);

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
        paid_period_start: newStart,
        paid_period_end: newEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (cycleChanged) {
    await supabaseAdmin
      .from("user_credits")
      .update({ paid_used: 0, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }
}

/**
 * ✅ UPSERT no profiles (PK = id)
 */
async function upsertProfile(args: {
  userId: string;
  isPro: boolean;
  customerId?: string | null;
  subscriptionId?: string | null;
  clearSubscriptionId?: boolean;
}) {
  const { userId, isPro, customerId, subscriptionId, clearSubscriptionId } = args;

  const patch: any = {
    id: userId,
    is_pro: isPro,
    updated_at: new Date().toISOString(),
  };

  if (customerId) patch.stripe_customer_id = customerId;
  if (subscriptionId) patch.stripe_subscription_id = subscriptionId;
  if (clearSubscriptionId) patch.stripe_subscription_id = null;

  const { error } = await supabaseAdmin.from("profiles").upsert(patch, { onConflict: "id" });
  if (error) throw error;
}

async function getUserIdByCustomerId(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { ok: false, error: "Missing webhook signature/secret" },
      { status: 400 }
    );
  }

  // ✅ body bruto (mais seguro p/ validação da assinatura)
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // ✅ idempotência
  try {
    const shouldProcess = await markEventProcessed(event.id);
    if (!shouldProcess) {
      return NextResponse.json({ received: true, deduped: true }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `Idempotency failed: ${e?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        const userId =
          session?.metadata?.user_id ||
          session?.client_reference_id ||
          null;

        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        const sub =
          subscriptionId
            ? await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ["items.data.price"],
              })
            : null;

        if (userId) {
          await upsertProfile({
            userId,
            isPro: true,
            customerId,
            subscriptionId,
          });

          if (sub) {
            await upsertCreditsFromSubscription({
              userId,
              sub,
              shouldBePro: isActiveSub(sub.status),
            });
          }
        } else if (customerId) {
          const foundUserId = await getUserIdByCustomerId(customerId);

          if (foundUserId) {
            await upsertProfile({
              userId: foundUserId,
              isPro: true,
              customerId,
              subscriptionId,
            });

            if (sub) {
              await upsertCreditsFromSubscription({
                userId: foundUserId,
                sub,
                shouldBePro: isActiveSub(sub.status),
              });
            }
          }
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Às vezes o objeto vem incompleto; buscamos o subscription "cheio" (exceto deleted)
        const subEventObj = event.data.object as any;

        const customerId = typeof subEventObj.customer === "string" ? subEventObj.customer : null;
        const userIdFromMeta = subEventObj?.metadata?.user_id || null;

        const shouldBePro =
          event.type === "customer.subscription.deleted"
            ? false
            : isActiveSub(subEventObj.status);

        let userId: string | null = userIdFromMeta;

        if (!userId && customerId) {
          userId = await getUserIdByCustomerId(customerId);
        }

        // Se for created/updated, tenta obter versão completa com items.price
        let subFull: any = subEventObj;
        if (event.type !== "customer.subscription.deleted" && subEventObj?.id) {
          try {
            subFull = await stripe.subscriptions.retrieve(subEventObj.id, {
              expand: ["items.data.price"],
            });
          } catch {
            // mantém subEventObj como fallback
            subFull = subEventObj;
          }
        }

        if (userId) {
          await upsertProfile({
            userId,
            isPro: shouldBePro,
            customerId,
            subscriptionId: subFull?.id ?? null,
            clearSubscriptionId: !shouldBePro,
          });

          await upsertCreditsFromSubscription({
            userId,
            sub: subFull,
            shouldBePro,
          });
        } else if (customerId) {
          // fallback final
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: shouldBePro,
              stripe_subscription_id: shouldBePro ? (subFull?.id ?? null) : null,
              updated_at: new Date().toISOString(),
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
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}
