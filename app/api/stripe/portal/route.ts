import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  const envUrl = process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
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

    const baseUrl = getBaseUrl(req);

    // Busca perfil
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    let customerId = profile?.stripe_customer_id ?? null;

    // ✅ Se não tiver customer ainda, cria e salva (upsert)
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .upsert({ id: user.id, stripe_customer_id: customerId }, { onConflict: "id" });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/upgrade`,
    });

    return NextResponse.json({ ok: true, url: portal.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
