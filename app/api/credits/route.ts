import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

// Free default (used only if DB doesn't have free_base)
const DEFAULT_FREE_BASE = 3;

function clamp(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
  }

  const { data: row, error } = await supabaseAdmin
    .from("user_credits")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const r: any = row ?? {};

  // ---- PAID (pro) ----
  const paidAllowance = Number(r.paid_monthly_allowance ?? 0);
  const paidUsed = Number(r.paid_used ?? 0);
  const paidRemaining = clamp(paidAllowance - paidUsed);

  // ---- BONUS (independente do plano) ----
  const bonusTotal = Number(
    r.bonus_referrals_total ??
    r.bonus_referral_total ??
    r.bonus_total ??
    r.bonus_earned ??
    0
  );
  const bonusUsed = Number(
    r.bonus_referrals_used ??
    r.bonus_referral_used ??
    r.bonus_used ??
    0
  );
  const bonusRemaining = clamp(bonusTotal - bonusUsed);

  // ---- PLAN ----
  const plan =
    r.plan ??
    (paidAllowance >= 300 ? "pro_plus" : paidAllowance >= 100 ? "pro" : "free");

  // ---- FREE (só para plano free, e desconta conforme usa) ----
  const freeBase = Number(r.free_base ?? DEFAULT_FREE_BASE);
  const freeUsed = Number(r.free_used ?? 0);
  const freeRemaining = plan === "free" ? clamp(freeBase - freeUsed) : 0;

  // ✅ TOTAL = free (se free) + bonus (sempre) + paid (se tiver)
  const totalRemaining = freeRemaining + bonusRemaining + paidRemaining;

  return NextResponse.json(
    {
      ok: true,
      plan,
      totalRemaining,
      breakdown: {
        freeRemaining,
        bonusRemaining,
        paidRemaining,
      },
      paid_period_start: r.paid_period_start ?? null,
      paid_period_end: r.paid_period_end ?? null,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
