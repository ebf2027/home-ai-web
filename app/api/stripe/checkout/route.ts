import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

type Plan = "pro" | "pro_plus";

function getBaseUrl(req: Request) {
  const envUrl = process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

async function safeReadJson(req: Request): Promise<any | null> {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return await req.json();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
    }

    // ✅ Choose plan via JSON body (default: pro)
    const body = await safeReadJson(req);
    const plan: Plan = body?.plan === "pro_plus" ? "pro_plus" : "pro";

    const priceId =
      plan === "pro_plus"
        ? process.env.STRIPE_PRICE_ID_PRO_PLUS
        : process.env.STRIPE_PRICE_ID_PRO;

    if (!priceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            plan === "pro_plus"
              ? "Missing STRIPE_PRICE_ID_PRO_PLUS"
              : "Missing STRIPE_PRICE_ID_PRO",
        },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);

    // 1) Read customerId from profile (if exists)
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (pErr) {
      return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id || null;

    // 2) Create customer if missing
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });

      customerId = customer.id;

      // ✅ Use UPSERT so profile row exists even if it didn't before
      const { error: upErr } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (upErr) {
        return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
      }
    }

    // 3) Create Checkout Session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,

      // helps linking even without metadata
      client_reference_id: user.id,

      // ✅ Put metadata also on the Subscription (important!)
      subscription_data: {
        metadata: { user_id: user.id, plan },
      },

      // ✅ Session metadata too (handy)
      metadata: { user_id: user.id, plan },

      // ✅ include session_id for debugging / future checks
      success_url: `${baseUrl}/upgrade?success=1&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
