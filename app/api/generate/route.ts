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

  const isExterior = roomType.toLowerCase().includes("facade") || roomType.toLowerCase().includes("exterior");
  const roomLabel = roomType === "other" ? "room" : roomType.replace(/_/g, " ");

  if (isExterior) {
    const exteriorModifiers: Record<string, string> = {
      "Modern": "cantilevered concrete, seamless floor-to-ceiling glass walls, geometric precision, luxury villa aesthetic",
      "Minimalist": "monolithic pure white surfaces, shadow-gap details, hidden frames, ethereal clean geometric form",
      "Scandinavian": "premium vertical light wood slats, smooth off-white stucco, panoramic windows, warm Nordic luxury",
      "Japanese": "charred wood (Shou Sugi Ban) elements, delicate timber screening, minimalist stone, serene Zen aesthetic",
      "Rustic": "hand-cut mountain stone walls, massive reclaimed oak beams, textured lime wash, timeless heritage prestige",
      "Industrial": "weathered steel accents, charcoal grey brickwork, massive black steel crittall windows, raw refined textures",
      "Boho": "hand-plastered soft cream walls, organic wooden textures, raffia and stone accents, relaxed Mediterranean coastal atmosphere",
      "Super Luxury": "book-matched marble panels, expansive seamless structural glass, integrated architectural LED linear lighting, reflecting pools, pinnacle of prestige",
    };
    const details = exteriorModifiers[style] || "";

    return [
      `Keep the exact building structure, all walls, windows, doors, and roofline in their exact original positions from the input photo. Do not add, remove, or relocate any architectural opening.`,
      `Restyle this ${roomLabel} as stunning high-end ${style} architecture featuring ${details}.`,
      `Professional exterior architectural photography, photorealistic, bright clear natural daylight. Preserve the original structure and camera perspective.`
    ].join(" ");
  }

  const interiorModifiers: Record<string, string> = {
    "Modern": "sleek low-profile furniture in matte charcoal and warm taupe, high-gloss or textured 3D accent wall, brass and black metal hardware, recessed warm LED perimeter lighting, polished porcelain floors, monochromatic palette with one bold jewel-tone accent, oversized abstract art with gold leaf, sculptural designer pendant, floor-to-ceiling curtains",
    "Minimalist": "honed marble and travertine surfaces, monochromatic ivory and warm greige palette, clean-lined oversized boucle and cashmere furniture, recessed architectural lighting, razor-thin shadow gaps, intentional negative space, serene uncluttered aesthetic",
    "Scandinavian": "warm wide-plank light wood floors, sleek off-white furniture with organic lines, cozy layered textiles in neutral tones, hygge atmosphere, natural and organic decor accents, soft warm lighting",
    "Japanese": "ultra-low minimalist furniture with clean horizontal lines, shoji-inspired translucent panels with dark frames, warm bamboo or tatami accents, wabi-sabi earth tones with deep moss green, akari-style paper lanterns, zen composition with ikebana arrangement, serene uncluttered space",
    "Rustic": "solid reclaimed barn wood furniture with visible grain and weathering, wrought iron hardware and vintage metal fixtures, exposed dark wood ceiling beams, warm amber Edison chandeliers, chunky wool throws and distressed leather, terracotta pottery, whitewashed brick or stone accent wall, vintage jute area rugs",
    "Industrial": "exposed brick accent wall, steel-pipe open shelving and metal-frame furniture, dark charcoal and gunmetal palette, cage Edison filament pendant lights, dark distressed leather upholstery, riveted metal details",
    "Boho": "macramé wall hangings, layered vintage Persian kilim rugs in jewel tones, curved rattan and wicker furniture, abundant hanging plants, earthy palette of terracotta mustard and sage green, eclectic global textiles, rattan pendant lights, floor cushions and leather poufs",
    "Super Luxury": "book-matched Calacatta Gold marble feature wall, Italian boiserie paneling with fluted channels and aged brass inlay, deep channel-tufted velvet furniture in champagne or dove grey, grand crystal chandelier with cascading prisms, silk and wool area rug, designer statement furniture, floor-to-ceiling silk drapes, herringbone white oak floors, floating linear fireplace with onyx surround, crown molding details",
  };
  const styleDetails = interiorModifiers[style] || "";

  return [
    `Keep every wall, window, door, and opening in their exact original position, size, and shape from the input photo. Do not add, remove, relocate, or resize any architectural element.`,
    `Update the ceiling to a luxury recessed tray design with integrated ambient lighting.`,
    `Restyle this ${roomLabel} with elegant high-end ${style} interior design featuring ${styleDetails}.`,
    `Photorealistic, Architectural Digest quality, warm soft natural light. Preserve the original room structure and camera angle.`
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

async function callFalImageEdit(args: {
  imageFile: File;
  prompt: string;
  guidanceScale?: number;
}) {
  const { imageFile, prompt, guidanceScale = 4 } = args;

  if (!FAL_KEY) throw new Error("Missing FAL_KEY in environment variables.");

  fal.config({ credentials: FAL_KEY });

  const rawBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(rawBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";
  const imageDataUrl = `data:${mimeType};base64,${base64}`;

  const result = await fal.subscribe("fal-ai/flux-kontext/dev", {
    input: {
      image_url: imageDataUrl,
      prompt,
      num_images: 1,
      guidance_scale: guidanceScale,
      num_inference_steps: 40,
      output_format: "jpeg",
    },
    logs: true,
    onQueueUpdate: (update: any) => {
      console.log(`[fal.ai] Queue status: ${update.status}`);
    },
  });

  const imageUrl: string | undefined =
    (result as any)?.data?.images?.[0]?.url ??
    (result as any)?.images?.[0]?.url;

  if (!imageUrl) {
    throw new Error("fal.ai response missing image URL.");
  }

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download fal.ai image (${imgRes.status}).`);

  const imgArr = await imgRes.arrayBuffer();
  const buf = Buffer.from(imgArr);

  return { buf, mime: "image/jpeg" };
}

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
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const style = normalizeText(styleRaw, "Modern");
  const roomType = normalizeText(roomTypeRaw, "room");
  const prompt = buildPrompt(style, roomType);

  let creditWasConsumed = false;
  let snapshot: CreditsSnapshot | null = null;

  if (!bypassCredits) {
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: `Credits check failed: ${fetchErr.message}` }, { status: 500 });
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
      updateData = { paid_used: paidUsed + 1, updated_at: new Date().toISOString() };
    } else if (bonusRemaining > 0) {
      updateData = { bonus_used: bonusUsed + 1, updated_at: new Date().toISOString() };
    } else if (freeRemaining > 0) {
      updateData = { free_used: freeUsed + 1, updated_at: new Date().toISOString() };
    } else {
      return NextResponse.json({ error: "No credits remaining." }, { status: 429 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("user_credits")
      .update(updateData)
      .eq("user_id", userId);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to consume credit: ${updateErr.message}` }, { status: 500 });
    }

    creditWasConsumed = true;
  }

  try {
    const isExteriorRoom = roomType.toLowerCase().includes("facade") || roomType.toLowerCase().includes("exterior");
    const { buf, mime } = await callFalImageEdit({ imageFile: image, prompt, guidanceScale: isExteriorRoom ? 7 : 4 });

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
    return NextResponse.json({ error: err?.message || "Unexpected error." }, { status: 500 });
  }
}