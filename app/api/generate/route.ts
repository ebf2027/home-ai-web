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
"Modern": "ultra-contemporary modern luxury interior space with architectural precision, illuminated by soft natural daylight streaming through the original grand floor-to-ceiling windows which must remain visible and prominent. Sophisticated recessed LED perimeter lighting with warm white temperature creates ambient glow. Center the composition around stunning low-profile primary furniture with matte charcoal or warm taupe high-gloss lacquered finishes, dressed with premium monochromatic upholstery and textiles in shades of grey and white, accented by bold jewel-tone elements in emerald, sapphire, or burnt orange. Complement the space with sleek geometric accent tables or counters in matte black with brass hardware and invisible touch-to-open mechanisms, topped with sculptural designer lamps featuring geometric shades. A statement curved accent chair in charcoal velvet with black metal legs sits elegantly near the windows, paired with a minimalist side table with brass details. One accent wall features textured 3D geometric wall panels or high-gloss lacquered finish. A tall sculptural floor lamp with geometric lines stands in a corner. Large-format oversized abstract canvas art with gold leaf details hangs elegantly. Sheer motorized blackout curtains frame the windows without obscuring them. A plush area rug in concrete grey with subtle geometric pattern grounds the space. Large-format polished porcelain tiles or seamless resin floors in concrete grey gleam softly. The refined palette consists of monochromatic greys, blacks, and whites with strategic bold jewel-tone accents. Integrated hidden storage with push-to-open mechanisms maintains clean lines. All architectural features including windows and doors remain completely intact and clearly visible",
      "Minimalist": "supremely refined minimalist luxury interior space with museum-quality restraint, bathed in pure diffused natural daylight streaming through the original expansive floor-to-ceiling windows which must remain visible and prominent. Invisible recessed lighting in ceiling coves provides subtle ambient glow. Center the composition around essential ultra-low-profile primary furniture with razor-sharp immaculate lines and weightless visual presence, featuring pure matte white finishes, dressed with pristine white organic linen textiles and a soft grey cashmere throw folded geometrically. Complement the space with minimal floating wall-mounted surfaces or counters in pure white with completely hidden storage (no visible handles), topped by a museum-quality sculptural ceramic lamp in white. A single essential lounge chair with organic curves in white linen sits near the windows with perfect negative space around it, accompanied by one simple wooden side table in pale oak. One museum-quality sculptural focal-point object (smooth stone sphere or minimal ceramic vessel) sits on a floating shelf. Floor-to-ceiling seamless hidden storage with push-to-open mechanisms lines one wall with invisible integration. Pure white smooth matte walls with invisible baseboards create serene backdrop. Simple sheer white linen curtains frame windows without covering them. Polished concrete or pale wide-plank oak floors in natural finish gleam softly. The monochrome palette consists exclusively of white, soft grey, and pale natural wood tones. Strategic negative space and completely uncluttered surfaces are essential. All architectural features including windows and doors remain completely intact and clearly visible with maximum breathing room",
      "Scandinavian": "ultra-refined Scandinavian luxury interior space with contemporary minimal elegance, bathed in soft diffused natural daylight streaming through the original grand floor-to-ceiling black-framed Crittall-style windows and glass doors which must remain visible and prominent. Warm ambient recessed cove ceiling lighting creates a serene atmosphere. Center the composition around exquisite primary furniture with sophisticated warm cream upholstery or cabinetry, dressed with premium white textiles, a textured oat-colored throw blanket delicately draped, and plush cushions in varying textures. Complement the space with matching light oak accent tables or surfaces featuring clean minimalist lines and subtle pulls, topped with elegant textured ceramic lamps with linen shades. A luxurious ivory bouclé accent chair with wooden legs sits gracefully in a corner near the windows, accompanied by a sculptural natural wood side table. A grand rustic heavily textured organic ceramic floor vase holds a magnificent arrangement of oversized fluffy pampas grass plumes positioned to complement not obstruct the architectural features. A large mature olive tree in an artisan terracotta pot stands elegantly in another corner. On the main wall hangs a single large-scale elegant minimalist abstract line-art drawing in a natural oak frame. Sheer flowing linen curtains frame the windows without covering them. A plush textured natural jute or wool area rug in warm beige grounds the space. The light oak hardwood flooring gleams softly. The refined palette consists of pristine white walls, ivory linens, warm beige and soft oat tones, with organic accents of natural terracotta and muted sage. All furniture pieces exhibit Scandinavian craftsmanship with clean lines and premium materials. The architectural integrity including all windows and glass doors remains completely intact and clearly visible",
      "Japanese": "serene zen-inspired Japanese luxury interior space with wabi-sabi elegance, illuminated by soft diffused natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent. Warm ambient paper lantern pendant lights (akari-style) provide gentle evening glow. Center the composition around ultra-low minimalist primary furniture with clean horizontal lines and no visible hardware, featuring natural linen or tatami textures in sand tones, dressed with premium organic cotton textiles in muted earth tones and a charcoal grey throw blanket folded precisely. Complement the space with low lacquered black wooden side tables or surfaces with clean minimal lines and hidden storage, topped with simple ceramic lamps in matte white. A low-profile meditation chair or floor cushion (zabuton) in deep moss green sits gracefully near the windows on a natural tatami mat. Shoji-inspired translucent sliding panels with black wooden frames create subtle spatial division without blocking windows. A warm natural bamboo accent wall adds organic texture. River stone and white gravel zen garden elements arranged in a shallow ceramic tray sit on a low wooden shelf. A single ikebana flower arrangement in a simple ceramic vase provides the only floral accent. Sliding fusuma doors with subtle nature prints lead to adjacent spaces. A handwoven natural fiber area rug in sand tones grounds the space. Natural bamboo or light oak flooring gleams softly. The muted wabi-sabi palette consists of sand, clay, charcoal, and deep moss green with forest accents. Serene uncluttered composition with intentional negative space creates tranquil atmosphere. All architectural features including windows remain completely intact and clearly visible",
      "Rustic": "warm inviting rustic luxury interior space with artisanal country elegance, bathed in soft natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent. Warm amber Edison filament bulb chandeliers on black iron chains provide intimate evening glow. Center the composition around magnificent solid reclaimed barn wood primary furniture with visible grain, knots, and natural weathering, featuring oatmeal linen upholstery, dressed with premium white textiles, a chunky cable-knit wool throw in cream, and layered cushions. Complement the space with massive solid wood accent tables or counters with hand-forged wrought iron hardware and visible saw marks, topped with vintage-inspired lamps with burlap shades. A distressed cognac leather wingback chair with nailhead trim sits invitingly near the windows, accompanied by a rustic wooden side table. Exposed rough-hewn dark wood ceiling beams with visible texture span overhead. A whitewashed brick or stone accent wall adds organic warmth. Artisanal terracotta pottery and raw stone accents sit on open wooden shelving. An antique wooden ladder leans decoratively against one wall. Wrought iron candelabra wall sconces provide accent lighting. A vintage woven jute area rug in natural tones grounds the space. Wide-plank reclaimed wood flooring in warm honey tones gleams softly. The warm palette consists of oatmeal, cream, cognac leather, terracotta, and weathered wood tones. Layered natural textiles create cozy warmth. All architectural features including windows remain completely intact and clearly visible",
      "Industrial": "edgy sophisticated industrial luxury interior space with urban warehouse character, illuminated by natural daylight streaming through the original floor-to-ceiling black steel-pipe Crittall-style windows which must remain visible and prominent. Oversized cage-style Edison filament pendant lights on fabric-wrapped cords provide dramatic evening glow. Center the composition around striking welded metal-frame primary furniture with rivet details and aged patina, featuring channel-tufted dark cognac leather elements, dressed with charcoal grey textiles and a gunmetal grey throw blanket. Complement the space with riveted metal accent tables or counters with reclaimed wood plank tops and visible weld seams, topped with industrial cage-style lamps with Edison bulbs. A dark distressed cognac leather tufted wingback chair sits boldly near the windows, accompanied by a repurposed factory cart side table with metal wheels. Raw exposed red brick accent wall with visible mortar texture and aged patina creates a dramatic focal point. Black steel-pipe open shelving with reclaimed wood planks displays vintage industrial objects. Exposed ductwork and conduit piping on ceiling adds authentic warehouse character. A vintage industrial fan sits in one corner. Metal locker-style storage units provide functional storage. A distressed area rug in charcoal with rust orange accents grounds the space. Polished concrete floors with visible aggregate gleam softly. The dark palette consists of charcoal, gunmetal grey, cognac leather, and rust orange accents. Raw materials and visible construction details create authentic industrial atmosphere. All architectural features including windows and exposed elements remain completely intact and clearly visible",
      "Boho": "eclectic vibrant bohemian luxury interior space with global wanderlust character, bathed in soft natural daylight streaming through the original floor-to-ceiling windows which must remain visible and prominent. Rattan pendant lights with macramé tassels provide warm evening glow. Center the composition around low curved rattan primary furniture with natural texture and carved wooden details, dressed with white textiles layered with colorful vintage elements including suzani embroidered cushions, Moroccan wedding blankets, and Indian block-print throws in jewel tones (ruby, sapphire, emerald). Complement the space with low wooden accent tables or counters with carved details and brass hardware, topped with ceramic lamps in terracotta with patterned shades. A large curved rattan peacock chair sits invitingly near the windows, accompanied by a Moroccan leather pouf in cognac. An oversized macramé wall hanging serves as a dramatic focal statement piece. Abundant hanging potted plants (pothos, string-of-pearls) cascade from ceiling corners, and a tall fiddle-leaf fig tree in a woven basket stands in one corner. Carved wooden screens create subtle room division without blocking windows. Dreamcatchers and beaded garlands add whimsical touches. Distressed wooden trunks provide storage. Multiple layered colorful vintage Persian and Turkish kilim rugs in jewel tones cover the floor. Natural wood or terracotta tile flooring peeks through. The warm earthy palette consists of terracotta, mustard yellow, burnt orange, sage green, and jewel tones. Eclectic global textiles and abundant plants create bohemian warmth. All architectural features including windows remain completely intact and clearly visible",
      "Super Luxury": "opulent museum-quality super luxury interior space with bespoke sophistication, bathed in soft diffused natural daylight streaming through the original grand floor-to-ceiling windows which must remain visible and prominent. Grand multi-tier crystal chandelier with cascading faceted prisms in aged brass frame provides spectacular ambient glow. Center the composition around extraordinary bespoke primary furniture and custom Italian boiserie integrated wall features with soft greige paneling, fluted vertical channels, and aged brass inlay trim extending floor-to-ceiling, dressed with the finest hand-stitched channel-tufted champagne velvet upholstery, silk pillows in dove grey, and a cashmere throw in warm sand beige draped artfully. Complement the space with museum-quality accent tables or counters in book-matched walnut with aged brass hardware and marble tops, topped with crystal lamps with silk shades. A statement curved velvet chaise lounge in soft dove grey with brass legs sits regally near the windows, accompanied by a sculptural smoked glass side table with brass legs. One feature wall showcases bespoke book-matched Calacatta Gold marble with dramatic gold and grey veining in high-gloss finish. A floating linear fireplace with backlit white onyx surround creates a focal point. Large-scale museum-quality black-and-white photography in ornate aged brass frames hangs gracefully. Fresh white orchid arrangements in crystal vases add organic elegance. Floor-to-ceiling silk drapes in champagne with hidden motorized track and blackout lining frame windows without covering them. A plush handwoven silk and wool area rug in ivory with subtle geometric pattern covers most of the floor. Herringbone wide-plank white oak floors in satin finish gleam beneath. Architectural crown molding and coffered ceiling details add dimension. Integrated smart lighting with warm LED strips in crown molding creates ambiance. The sophisticated palette consists of champagne, soft dove grey, warm sand beige, aged brass, and Calacatta marble tones. Leather-wrapped decorative trays with coffee table books add refined details. All architectural features including windows remain completely intact and clearly visible with regal presence"
    };
    interiorStyleDetails = interiorModifiers[style] ? `, featuring ${interiorModifiers[style]}` : "";
  }

  const styleDetails = isExterior ? exteriorStyleDetails : interiorStyleDetails;

  return [
    `Completely redesign this ${roomType} into a stunning high-end ${style} style ${category}${styleDetails}.`,
    `CRITICAL ROOM TYPE: This is a ${roomType}. You MUST generate a ${roomType} with furniture and layout appropriate for a ${roomType}. Do NOT generate a bedroom unless the room type is bedroom.`,
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