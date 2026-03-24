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
  const category = isExterior ? "exterior architecture" : "interior";
  const elements = isExterior ? "facade materials, finishes, textures, and outdoor lighting" : "furniture, decor, materials, textures, colors, and lighting";

  const lightingInstruction = isExterior ? "bright, clear natural daylight, natural exterior illumination" : "warm, soft natural light flooding the room";

  let exteriorStyleDetails = "";
  if (isExterior) {
    const modifiers: Record<string, string> = {
      "Modern": "iconic contemporary architecture, cantilevered concrete structures, seamless floor-to-ceiling glass walls, ultra-sharp geometric precision, luxury villa aesthetic",
      "Minimalist": "museum-grade architectural minimalism, monolithic pure white surfaces, shadow-gap details, hidden frames, ethereal and clean geometric form",
      "Scandinavian": "architectural Nordic masterpiece, premium vertical light wood slats, smooth off-white stucco, oversized panoramic windows, warm hygge luxury exterior",
      "Japanese": "contemporary Zen architecture, charred wood (Shou Sugi Ban) elements, delicate timber screening, minimalist stone integration, serene and high-end aesthetic",
      "Rustic": "high-end Alpine-inspired luxury estate, hand-cut mountain stone walls, massive reclaimed oak beams, artisanal textured lime wash, timeless heritage prestige",
      "Industrial": "luxury industrial loft facade, weathered steel accents, premium charcoal grey brickwork, massive black steel crittall windows, raw yet refined architectural textures",
      "Boho": "Mediterranean luxury boho villa, hand-plastered soft cream walls, organic wooden textures, raffia and stone accents, relaxed high-end coastal atmosphere",
      "Super Luxury": "ultra-exclusive billionaire mansion facade, book-matched marble panels, expansive seamless structural glass, integrated architectural LED linear lighting, reflecting pools, the pinnacle of prestige",
    };
    exteriorStyleDetails = modifiers[style] ? `, with a specific focus on highlighting ${modifiers[style]}` : "";
  }

  let interiorStyleDetails = "";
  if (!isExterior) {
    const interiorModifiers: Record<string, string> = {
      "Modern": "sleek low-profile furniture with clean geometric lines in matte charcoal or warm taupe, high-gloss lacquered accent wall or textured 3D wall panels, bold geometric shapes with brass or black metal hardware, recessed LED perimeter lighting with warm white temperature, large-format polished porcelain tiles or seamless resin floors in concrete grey, monochromatic palette (grey, black, white) with a single bold jewel-tone accent (emerald, sapphire, or burnt orange), oversized abstract canvas art with gold leaf details, sculptural designer pendant light, floor-to-ceiling blackout curtains with motorized track, integrated hidden storage with push-to-open mechanisms",
      "Minimalist": "only essential furniture with razor-sharp immaculate lines and weightless visual presence, pure white smooth matte walls with invisible baseboards, floor-to-ceiling seamless hidden storage with push-to-open mechanisms (no visible handles), completely uncluttered empty surfaces with strategic negative space, simple organic linen or cotton textiles in monochrome white or soft grey, a single museum-quality sculptural focal-point object (stone sphere, ceramic vessel, or bonsai), invisible recessed lighting in ceiling coves, low-profile furniture with integrated surfaces, polished concrete or pale wide-plank oak floors",
      "Scandinavian": "Keep the room dimensions and all structural elements identical. Add Scandinavian interior design: light wood floors, white and light gray walls, minimal furniture with clean lines  natural textures, indoor plants, soft natural lighting, cozy textiles in whites and beiges, and functional minimalist decor. Focus only on furniture and decoration, never alter the architecture.",
      "Japanese": "ultra-low minimalist furniture with clean horizontal lines and no visible hardware, shoji-inspired translucent sliding panels with black wooden frames dividing spaces, warm natural bamboo accent wall or woven tatami mat flooring, river stone and white gravel zen garden elements in ceramic trays, muted wabi-sabi earth tones (sand, clay, charcoal) with deep moss green and forest accents, low lacquered black wooden furniture pieces, traditional paper lantern pendant lights (akari-style), serene uncluttered zen composition with single ikebana flower arrangement, sliding fusuma doors with subtle nature prints, floor cushions (zabuton) for seating",
      "Rustic": "massive solid reclaimed barn wood furniture with visible grain, knots, and natural weathering, hand-forged wrought iron hardware and vintage metal fixtures, exposed rough-hewn dark wood ceiling beams with visible saw marks, warm amber Edison filament bulb chandeliers on black iron chains, layered natural textiles (chunky cable-knit wool throws, distressed leather seating, linen fabrics in oatmeal), artisanal terracotta pottery and raw stone accents on open shelving, whitewashed brick or stone accent wall, vintage woven jute area rugs, antique wooden ladders repurposed as decorative elements, wrought iron candelabra wall sconces, farmhouse-style wooden dining or console tables",
      "Industrial": "raw exposed brick accent wall, steel-pipe open shelving and metal-frame furniture, dark charcoal and gunmetal gray color palette, cage-style Edison filament pendant lights, dark distressed leather upholstery, riveted metal details and factory-style windows",
      "Boho": "oversized macramé wall hangings as focal statement pieces or large woven rattan furniture, layered colorful vintage Persian and Turkish kilim rugs in jewel tones (ruby, sapphire, emerald), curved rattan and wicker furniture with natural texture and low wooden elements, abundant hanging potted plants (pothos, string-of-pearls) and tall fiddle-leaf fig trees, warm earthy color palette (terracotta, mustard yellow, burnt orange, sage green), eclectic global textiles (suzani embroidered cushions, Moroccan wedding blankets, Indian block-print throws), rattan pendant lights with tassels, distressed wooden trunks and vintage furniture pieces, floor cushions and moroccan leather poufs, dreamcatcher and beaded garlands, carved wooden screens and room dividers",
      "Super Luxury": "bespoke book-matched Calacatta Gold marble feature wall with dramatic gold and grey veining in high-gloss finish, custom Italian boiserie wall paneling in soft greige or warm taupe with fluted vertical channels and aged brass inlay trim, hand-stitched deep channel-tufted velvet upholstered furniture in sophisticated neutrals (champagne, soft dove grey, or warm sand beige), grand multi-tier crystal chandelier with cascading faceted prisms in aged brass frame, plush handwoven silk and wool area rug in ivory or taupe covering most of floor with subtle geometric pattern, statement designer furniture pieces (curved velvet seating, sculptural leather lounge chairs, smoked glass surfaces with brass legs), floor-to-ceiling silk drapes in champagne or greige with hidden motorized track and blackout lining, herringbone or chevron wide-plank white oak floors in satin finish, museum-quality large-scale black-and-white photography or abstract oil painting in ornate aged brass frames, fresh white orchid arrangements in crystal vases, integrated smart lighting with warm LED strips in crown molding, floating linear fireplace with backlit white onyx or alabaster surround, architectural crown molding and coffered ceiling details, leather-wrapped decorative trays with coffee table books, cashmere throws draped artfully",
    };
    interiorStyleDetails = interiorModifiers[style] ? `, featuring ${interiorModifiers[style]}` : "";
  }

  const styleDetails = isExterior ? exteriorStyleDetails : interiorStyleDetails;

  return [
     `Completely redesign this ${roomType} into a stunning high-end ${style} style ${category}${styleDetails}.`,
    `REMOVE all existing ${elements} entirely and REPLACE them with luxurious ${style} style equivalents.`,
    `Keep the exact same camera angle, perspective, room structure, walls, ceiling height, and floor layout.`,
    `CRITICAL: DO NOT move, remove, resize, or alter doors, windows, or any architectural openings. Keep ALL existing windows and doors EXACTLY as they appear in the original photo — same size, same position, same quantity. Do not convert windows into doors or doors into windows. Preserve the exact window configuration.`,
    `Preserve all architectural proportions and spatial structure — only redesign the ${isExterior ? "facade" : "interior design"}, furniture, materials, and finishes.`,
    `Result must look like a professional ${style} ${category} photo shoot published in Architectural Digest: photorealistic, magazine-quality, ${lightingInstruction}, coherent natural shadows, no text, no watermark.`,

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
  const { imageFile, prompt, guidanceScale = 12 } = args;

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
      num_inference_steps: 35,
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
    const { buf, mime } = await callFalImageEdit({ imageFile: image, prompt, guidanceScale: isExteriorRoom ? 13 : 12 });

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