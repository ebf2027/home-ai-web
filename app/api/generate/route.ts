import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";

const PRO_BYPASS_USER_IDS = (process.env.PRO_BYPASS_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const FAL_KEY = process.env.FAL_KEY;

function normalizeText(v: unknown, fallback: string) {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  return s.length ? s : fallback;
}

function buildPrompt(styleRaw: string, roomTypeRaw: string) {
  const style = styleRaw.trim();
  const roomType = roomTypeRaw.trim();

  // Detecta se é uma Fachada para ajustar os termos do prompt
  const isExterior = roomType.toLowerCase().includes("facade") || roomType.toLowerCase().includes("exterior");
  const category = isExterior ? "exterior architecture" : "interior";
  const elements = isExterior ? "facade materials, finishes, textures, and outdoor lighting" : "furniture, decor, materials, textures, colors, and lighting";

  return [
    `Transform this ${roomType} into a stunning ${style} style ${category}.`,
    `COMPLETELY replace all ${elements} with ${style} style equivalents.`,
    `Keep the exact same camera angle, perspective, structure shape, walls, and layout.`,
    `DO NOT move or remove doors, windows, or openings. Keep doors and windows clearly visible in the same positions.`,
    `Preserve the architecture and proportions — only redesign the ${isExterior ? "facade" : "interior"} style and finishes.`,
    `Result must look like a professional ${style} ${category} design photo: realistic, high quality, natural light, coherent shadows, no text, no watermark.`,
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

async function refundOneCreditBestEffort(userId: string, before: CreditsSnapshot | null) {
  if (!before) return;

  const { data: nowRow } = await supabaseAdmin
    .from("user_credits")
    .select("free_used,paid_used,bonus_used")
    .eq("user_id", userId)
    .maybeSingle();

  if (!nowRow) return;

  const now: any = nowRow;

  if (num(now.paid_used) === before.paid_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ paid_used: before.paid_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("paid_used", before.paid_used + 1);
    return;
  }

  if (num(now.bonus_used) === before.bonus_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ bonus_used: before.bonus_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("bonus_used", before.bonus_used + 1);
    return;
  }

  if (num(now.free_used) === before.free_used + 1) {
    await supabaseAdmin
      .from("user_credits")
      .update({ free_used: before.free_used, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("free_used", before.free_used + 1);
    return;
  }
}

// ─── fal.ai FLUX Kontext Dev ──────────────────────────────────────────────
async function callFalImageEdit(args: {
  imageFile: File;
  prompt: string;
}) {
  const { imageFile, prompt } = args;

  console.log("[fal.ai] FAL_KEY present:", !!FAL_KEY);
  console.log("[fal.ai] FAL_KEY prefix:", FAL_KEY?.slice(0, 8));

  if (!FAL_KEY) throw new Error("Missing FAL_KEY in environment variables.");

  fal.config({ credentials: FAL_KEY });

  console.log("[fal.ai] Converting image to base64...");
  const rawBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(rawBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";
  const imageDataUrl = `data:${mimeType};base64,${base64}`;
  console.log("[fal.ai] Image size (bytes):", rawBuffer.byteLength, "| mime:", mimeType);

  console.log("[fal.ai] Calling fal.subscribe...");

  const result = await fal.subscribe("fal-ai/flux-kontext/dev", {
    input: {
      image_url: imageDataUrl,
      prompt,
      num_images: 1,
      // --- Ajuste Cirúrgico para Força do Prompt apenas em Fachadas ---
      guidance_scale: prompt.toLowerCase().includes("facade design") ? 13 : 10,
      // -------------------------------------------------------------
      num_inference_steps: 35,
      output_format: "jpeg",
    },
    logs: true,
    onQueueUpdate: (update: any) => {
      console.log(`[fal.ai] Queue status: ${update.status}`);
      if (update.logs) {
        update.logs.forEach((l: any) => console.log("[fal.ai log]", l.message));
      }
    },
  });

  console.log("[fal.ai] Raw result keys:", Object.keys(result ?? {}));

  const imageUrl: string | undefined =
    (result as any)?.data?.images?.[0]?.url ??
    (result as any)?.images?.[0]?.url;

  if (!imageUrl) {
    console.error("[fal.ai] Full result:", JSON.stringify(result).slice(0, 1000));
    throw new Error("fal.ai response missing image URL.");
  }

  console.log("[fal.ai] Image URL received, downloading...");

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download fal.ai image (${imgRes.status}).`);

  const imgArr = await imgRes.arrayBuffer();
  const buf = Buffer.from(imgArr);

  console.log("[fal.ai] Done! Buffer size:", buf.byteLength);

  return { buf, mime: "image/jpeg" };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "You need to be signed in to continue." }, { status: 401 });
  }

  const userId = user.id;
  const bypassCredits = PRO_BYPASS_USER_IDS.includes(userId);

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

    const r: any = row ?? {};
    if (!row) await ensureCreditsRow(userId);

    const DEFAULT_FREE_BASE = 3;
    const clamp = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

    const paidAllowance = Number(r.paid_monthly_allowance ?? 0);
    const paidUsed = Number(r.paid_used ?? 0);
    const paidRemaining = clamp(paidAllowance - paidUsed);

    const bonusTotal = Number(r.bonus_referrals_total ?? r.bonus_referral_total ?? r.bonus_total ?? r.bonus_earned ?? 0);
    const bonusUsed = Number(r.bonus_referrals_used ?? r.bonus_referral_used ?? r.bonus_used ?? 0);
    const bonusRemaining = clamp(bonusTotal - bonusUsed);

    const plan = r.plan ?? (paidAllowance >= 300 ? "pro_plus" : paidAllowance >= 100 ? "pro" : "free");
    const freeBase = Number(r.free_base ?? DEFAULT_FREE_BASE);
    const freeUsed = Number(r.free_used ?? 0);
    const freeRemaining = plan === "free" ? clamp(freeBase - freeUsed) : 0;

    snapshot = { free_used: freeUsed, paid_used: paidUsed, bonus_used: bonusUsed };

    let updateData: any = null;

    if (paidRemaining > 0) {
      consumptionType = "paid";
      updateData = { paid_used: paidUsed + 1, updated_at: new Date().toISOString() };
    } else if (bonusRemaining > 0) {
      consumptionType = "bonus";
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

  try {
    const { buf, mime } = await callFalImageEdit({ imageFile: image, prompt });

    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    return new Response(arrayBuffer, {
      status: 200,
      headers: { "Content-Type": mime, "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    if (!bypassCredits && creditWasConsumed) {
      await refundOneCreditBestEffort(userId, snapshot);
    }

    console.error("[/api/generate] FINAL ERROR:", err?.message ?? err);
    const msg = err?.message || "Unexpected error while generating the image.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}