import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  // Prefer env APP_URL (produção), fallback para host atual
  const envUrl = process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe(); // ✅ aqui é o lugar certo

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID_PRO" }, { status: 500 });
    }

    const baseUrl = getBaseUrl(req);

    // 1) Pega/Cria customer
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (pErr) {
      return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    // 2) Checkout session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,

      // ajuda a reconciliar
      client_reference_id: user.id,

      // garante que a subscription também carrega o user_id
      subscription_data: {
        metadata: { user_id: user.id },
      },

      // para o webhook achar o usuário com certeza
      metadata: { user_id: user.id },

      success_url: `${baseUrl}/upgrade?success=1`,
      cancel_url: `${baseUrl}/upgrade?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
