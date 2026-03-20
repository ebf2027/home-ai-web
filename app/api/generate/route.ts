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
       "Modern": "ultra-contemporary modern luxury design with architectural precision. Use a sophisticated palette of monochromatic greys, blacks, and whites with strategic bold jewel-tone accents (emerald, sapphire, or burnt orange). Feature low-profile furniture with integrated floating elements in matte charcoal or warm taupe high-gloss lacquered finishes. Include recessed LED perimeter lighting with warm white temperature, sculptural designer lighting fixtures with geometric shapes, large-format polished porcelain or seamless resin floors in concrete grey, textured 3D geometric wall panels or high-gloss lacquered accent wall, integrated hidden storage with push-to-open mechanisms, and oversized abstract canvas art with gold leaf details. Illuminated by soft natural daylight streaming through the grand floor-to-ceiling windows which must remain visible and prominent",
  "Minimalist": "supremely refined minimalist luxury design with museum-quality restraint. Use an exclusively monochrome palette of white, soft grey, and pale natural wood tones. Feature essential furniture with razor-sharp immaculate lines and weightless visual presence in pure matte white finishes. Include invisible recessed ceiling cove lighting, museum-quality sculptural ceramic lamps in white, floor-to-ceiling seamless hidden storage with push-to-open mechanisms, pure white smooth matte walls with invisible baseboards, simple sheer white linen curtains, and polished concrete or pale wide-plank oak floors. Strategic negative space and completely uncluttered surfaces are essential. Bathed in pure diffused natural daylight streaming through the expansive floor-to-ceiling windows which must remain visible and prominent",
  "Scandinavian": "ultra-refined Scandinavian luxury design with contemporary minimal elegance. Use a refined palette of pristine white walls, ivory linens, warm beige and soft oat tones, with organic accents of natural terracotta and muted sage. Feature furniture in light oak with clean minimalist lines and subtle drawer pulls, upholstered pieces in warm cream linen, and bouclé textures. Include warm ambient recessed cove ceiling lighting, textured ceramic lamps with linen shades, grand rustic organic ceramic floor vases with oversized pampas grass, mature olive trees in artisan terracotta pots, large-scale minimalist abstract line-art in natural oak frames, sheer flowing linen curtains, and plush textured natural jute or wool area rugs in warm beige. Illuminated by soft diffused natural daylight streaming through the original grand floor-to-ceiling black-framed Crittall-style windows which must remain visible and prominent",
  "Japanese": "serene zen-inspired Japanese luxury design with wabi-sabi elegance. Use a muted wabi-sabi palette of sand, clay, charcoal, and deep moss green with forest accents. Feature ultra-low minimalist furniture with clean horizontal lines and no visible hardware in natural linen or tatami texture in sand tones. Include warm ambient akari-style paper lantern pendant lights, shoji-inspired translucent sliding panels with black wooden frames, warm natural bamboo accent wall, river stone and white gravel zen garden elements in shallow ceramic trays, single ikebana flower arrangements in simple ceramic vases, handwoven natural fiber area rugs in sand tones, and natural bamboo or light oak flooring. Serene uncluttered composition with intentional negative space. Illuminated by soft diffused natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent",
  "Rustic": "warm inviting rustic luxury design with artisanal country elegance. Use a warm palette of oatmeal, cream, cognac leather, terracotta, and weathered wood tones. Feature solid reclaimed barn wood furniture with visible grain, knots, and natural weathering, tufted linen upholstered pieces in oatmeal, and distressed cognac leather. Include warm amber Edison filament bulb chandeliers on black iron chains, wrought iron candelabra wall sconces, exposed rough-hewn dark wood ceiling beams, whitewashed brick or stone accent walls, artisanal terracotta pottery and raw stone accents on open wooden shelving, antique wooden ladders as decorative elements, vintage woven jute area rugs, and wide-plank reclaimed wood flooring in warm honey tones. Layered natural textiles. Bathed in soft natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent",
  "Industrial": "edgy sophisticated industrial luxury design with urban warehouse character. Use a dark palette of charcoal, gunmetal grey, cognac leather, and rust orange accents. Feature welded metal-frame furniture with rivet details and aged patina, dark distressed cognac leather pieces, and riveted metal surfaces with reclaimed wood plank tops. Include oversized cage-style Edison filament pendant lights on fabric-wrapped cords, raw exposed red brick accent wall with visible mortar texture, black steel-pipe open shelving with reclaimed wood planks, exposed ductwork and conduit piping on ceiling, vintage industrial fans, metal locker-style storage units, distressed area rugs in charcoal with rust orange accents, and polished concrete floors with visible aggregate. Raw materials and visible construction details. Illuminated by natural daylight streaming through the original floor-to-ceiling black steel-pipe Crittall-style windows which must remain visible and prominent",
  "Boho": "eclectic vibrant bohemian luxury design with global wanderlust character. Use a warm earthy palette of terracotta, mustard yellow, burnt orange, sage green, and jewel tones. Feature low curved rattan furniture with natural texture, carved wooden pieces with intricate details and brass hardware, and layered colorful vintage textiles including suzani embroidered cushions, Moroccan wedding blankets, and Indian block-print throws. Include rattan pendant lights with macramé tassels, oversized macramé wall hangings, abundant hanging potted plants cascading from ceiling corners, tall fiddle-leaf fig trees in woven baskets, carved wooden screens, dreamcatchers and beaded garlands, multiple layered colorful vintage Persian and Turkish kilim rugs, and natural wood or terracotta tile flooring. Bathed in soft natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent",
  "Super Luxury": "opulent museum-quality super luxury design with bespoke sophistication. Use a sophisticated palette of champagne, soft dove grey, warm sand beige, aged brass, and Calacatta marble tones. Feature custom Italian boiserie wall paneling in soft greige with fluted vertical channels and aged brass inlay trim, curved velvet furniture in soft dove grey with brass legs, and museum-quality pieces in book-matched walnut with aged brass hardware and marble tops. Include grand multi-tier crystal chandelier with cascading faceted prisms in aged brass, floating linear fireplace with backlit white onyx surround, large-scale museum-quality photography in ornate aged brass frames, fresh white orchid arrangements in crystal vases, floor-to-ceiling silk drapes in champagne with hidden motorized track, plush handwoven silk and wool area rugs in ivory with subtle geometric pattern, herringbone wide-plank white oak floors in satin finish, architectural crown molding and coffered ceiling details, and integrated smart LED strip lighting in crown molding. Bathed in soft diffused natural daylight streaming through the original grand floor-to-ceiling windows which must remain visible and prominent",
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