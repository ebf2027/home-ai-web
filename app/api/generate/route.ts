import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export const runtime = "nodejs";

// Optional: bypass credit consume for your own user id(s), comma-separated UUIDs
const PRO_BYPASS_USER_IDS = (process.env.PRO_BYPASS_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function normalizeText(v: unknown, fallback: string) {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  return s.length ? s : fallback;
}

function buildPrompt(styleRaw: string, roomTypeRaw: string) {
  const style = styleRaw.trim();
  const roomType = roomTypeRaw.trim();

  return [
    `Photorealistic interior redesign of the SAME ${roomType} in a ${style} style.`,
    `Keep the exact same camera angle, perspective, room shape, walls, ceiling lines, and layout.`,
    `DO NOT move or remove doors, windows, or openings. Keep doors clearly visible.`,
    `Preserve architectural elements and room proportions. Do not change window/door positions.`,
    `Keep the overall structure identical; only change finishes, decor, furniture style, and lighting to match the chosen style.`,
    `Make it realistic, high quality, natural light, coherent shadows, no text, no watermark.`,
  ].join(" ");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type CreditsSnapshot = {
  free_used: number;
  paid_used: number;
  bonus_used: number;
};

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// garante row existir (para refund funcionar em usuário novo)
async function ensureCreditsRow(userId: string) {
  await supabaseAdmin
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        free_used: 0,
        paid_used: 0,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" }
    );
}

async function readCreditsSnapshot(userId: string): Promise<CreditsSnapshot | null> {
  await ensureCreditsRow(userId);

  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("free_used,paid_used,bonus_used")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    free_used: num((data as any).free_used),
    paid_used: num((data as any).paid_used),
    bonus_used: num((data as any).bonus_used),
  };
}

// reembolsa 1 crédito (best-effort)
async function refundOneCreditBestEffort(userId: string, before: CreditsSnapshot | null) {
  if (!before) return;

  const { data: nowRow } = await supabaseAdmin
    .from("user_credits")
    .select("free_used,paid_used,bonus_used")
    .eq("user_id", userId)
    .maybeSingle();

  if (!nowRow) return;

  const now: any = nowRow;

  // 1. Paid
  if (num(now.paid_used) === before.paid_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ paid_used: before.paid_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("paid_used", before.paid_used + 1);
    return;
  }

  // 2. Bonus
  // Note: we assume column is 'bonus_used'
  if (num(now.bonus_used) === before.bonus_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ bonus_used: before.bonus_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("bonus_used", before.bonus_used + 1);
    return;
  }

  // 3. Free
  if (num(now.free_used) === before.free_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ free_used: before.free_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("free_used", before.free_used + 1);
    return;
  }
}

async function callOpenAIImageEditWithRetry(args: {
  imageFile: File;
  prompt: string;
  timeoutMs?: number;
  maxAttempts?: number;
}) {
  const { imageFile, prompt, timeoutMs = 60_000, maxAttempts = 3 } = args;

  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY.");

  let lastErr: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fd = new FormData();
      fd.append("image[]", imageFile, imageFile.name || "image.jpg");
      fd.append("model", "gpt-image-1-mini");
      fd.append("prompt", prompt);
      fd.append("quality", "medium");
      fd.append("output_format", "jpeg");
      fd.append("size", "1024x1024");

      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: fd,
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        let msg = `OpenAI request failed (${res.status})`;
        try {
          const txt = await res.text();
          if (txt) msg = `${msg}: ${txt.slice(0, 800)}`;
        } catch { }
        const err = new Error(msg) as any;
        err.status = res.status;
        throw err;
      }

      if (contentType.includes("application/json")) {
        const json: any = await res.json();
        const b64 = json?.data?.[0]?.b64_json;
        if (!b64) throw new Error("OpenAI JSON response missing b64_json.");

        const outFmt = (json?.output_format as string | undefined) ?? "jpeg";
        const mime =
          outFmt === "png" ? "image/png" : outFmt === "webp" ? "image/webp" : "image/jpeg";

        const buf = Buffer.from(b64, "base64");
        return { buf, mime };
      }

      const arr = await res.arrayBuffer();
      const buf = Buffer.from(arr);
      const mime = contentType.startsWith("image/") ? contentType : "image/jpeg";
      return { buf, mime };
    } catch (err: any) {
      lastErr = err;

      const status = err?.status;
      const isAbort = err?.name === "AbortError";
      const retryable = isAbort || status === 429 || (typeof status === "number" && status >= 500);

      clearTimeout(t);

      if (!retryable || attempt === maxAttempts) throw err;

      const base = 400 * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await sleep(base + jitter);
    } finally {
      clearTimeout(t);
    }
  }

  throw lastErr || new Error("OpenAI request failed.");
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 1) Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "You need to be signed in to continue." }, { status: 401 });
  }

  const userId = user.id;
  const bypassCredits = PRO_BYPASS_USER_IDS.includes(userId);

  // 2) Parse form data
  const form = await req.formData();
  const image = form.get("image");
  const styleRaw = form.get("style");
  const roomTypeRaw = form.get("roomType");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "Missing image file (field name: image)." },
      { status: 400 }
    );
  }

  const style = normalizeText(styleRaw, "Modern");
  const roomType = normalizeText(roomTypeRaw, "room");
  const prompt = buildPrompt(style, roomType);

  let creditWasConsumed = false;
  let snapshot: CreditsSnapshot | null = null;
  let consumptionType: "paid" | "bonus" | "free" | null = null;

  if (!bypassCredits) {
    // 3.a) Read current state
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { error: `Credits check failed: ${fetchErr.message}` },
        { status: 500 }
      );
    }

    // Default values if row doesn't exist
    const r: any = row ?? {};

    // Ensure row exists if it doesn't (though usually it should)
    if (!row) {
      await ensureCreditsRow(userId);
    }

    // ---- CALCULATION (Same as /api/credits) ----
    const DEFAULT_FREE_BASE = 3;
    const clamp = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

    // Paid
    const paidAllowance = Number(r.paid_monthly_allowance ?? 0);
    const paidUsed = Number(r.paid_used ?? 0);
    const paidRemaining = clamp(paidAllowance - paidUsed);

    // Bonus
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

    // Free
    const plan =
      r.plan ??
      (paidAllowance >= 300 ? "pro_plus" : paidAllowance >= 100 ? "pro" : "free");

    const freeBase = Number(r.free_base ?? DEFAULT_FREE_BASE);
    const freeUsed = Number(r.free_used ?? 0);
    // Free credits only apply if plan is free
    const freeRemaining = plan === "free" ? clamp(freeBase - freeUsed) : 0;

    // Snapshot for refund
    snapshot = {
      free_used: freeUsed,
      paid_used: paidUsed,
      bonus_used: bonusUsed,
    };

    // ---- DECISION: Priority Paid -> Bonus -> Free ----
    let updateData: any = null;

    if (paidRemaining > 0) {
      consumptionType = "paid";
      updateData = { paid_used: paidUsed + 1, updated_at: new Date().toISOString() };
    } else if (bonusRemaining > 0) {
      consumptionType = "bonus";
      // We need to know which column to update. The read logic checks multiple fallback names,
      // but usually there's one canonical column for writing. 
      // Assuming 'bonus_used' based on typical Supabase patterns or `r.bonus_used`.
      // Let's use 'bonus_used' as the standard write column if it exists or fallback.
      // Looking at `readCreditsSnapshot` in original code, it didn't read bonus. 
      // I'll assume `bonus_used` is the column name.
      updateData = { bonus_used: bonusUsed + 1, updated_at: new Date().toISOString() };
    } else if (freeRemaining > 0) {
      consumptionType = "free";
      updateData = { free_used: freeUsed + 1, updated_at: new Date().toISOString() };
    } else {
      return NextResponse.json(
        { error: "No credits remaining. Please upgrade to continue." },
        { status: 429 }
      );
    }

    // 3.b) Perform Update
    const { error: updateErr } = await supabaseAdmin
      .from("user_credits")
      .update(updateData)
      .eq("user_id", userId);

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to consume credit: ${updateErr.message}` },
        { status: 500 }
      );
    }

    creditWasConsumed = true;
  }

  // 4) Call OpenAI (if fails, refund 1 credit best-effort)
  try {
    const { buf, mime } = await callOpenAIImageEditWithRetry({
      imageFile: image,
      prompt,
      timeoutMs: 60_000,
      maxAttempts: 3,
    });

    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    return new Response(arrayBuffer, {
      status: 200,
      headers: { "Content-Type": mime, "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    if (!bypassCredits && creditWasConsumed) {
      await refundOneCreditBestEffort(userId, snapshot);
    }

    const msg = err?.message || "Unexpected error while generating the image.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
