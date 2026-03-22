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

  const isExterior =
    roomType.toLowerCase().includes("facade") ||
    roomType.toLowerCase().includes("exterior");

  const category = isExterior ? "exterior architecture" : "interior";
  const elements = isExterior
    ? "facade materials, finishes, textures, and outdoor lighting"
    : "furniture, decor, materials, textures, colors, and lighting";
  const lightingInstruction = isExterior
    ? "bright, clear natural daylight, natural exterior illumination"
    : "warm, soft natural light flooding the room";

  // ── EXTERIOR STYLE MODIFIERS (unchanged) ──────────────────────────────────
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
    exteriorStyleDetails = modifiers[style]
      ? `, with a specific focus on highlighting ${modifiers[style]}`
      : "";
  }

  // ── INTERIOR STYLE MODIFIERS ───────────────────────────────────────────────
  const interiorStyleModifiers: Record<string, string> = {
    "Scandinavian": "wide-plank light oak hardwood floors, smooth matte white walls, sheer linen curtains in warm sand framing the existing windows, warm soft diffused natural light. Furniture: upholstered platform bed with tall padded linen headboard in warm ivory, crisp white bedding with beige waffle-knit throw, round natural oak nightstands with sculptural ceramic lamps, large chunky-knit wool area rug in warm oatmeal covering most of the floor, curved bouclé ivory armchair with oak legs, open oak shelving unit with neatly folded white linens and ceramic objects, tall olive tree in textured terracotta pot, one oversized minimalist botanical line-art print in thin oak frame. Palette: white, warm beige, natural oak, oatmeal, sand.",
    "Modern": "large-format polished concrete-look porcelain floors, smooth walls with one textured 3D panel accent wall in warm taupe, recessed LED perimeter cove lighting with warm white temperature, floor-to-ceiling blackout curtains in charcoal on motorized track. Furniture: low-profile platform bed with tall geometric tufted headboard in dark charcoal velvet, crisp white bedding with bold geometric throw, floating bedside shelves with sculptural brass lamps, large plush area rug in dark grey with subtle geometric pattern, sleek lounge chair in cognac leather with black metal frame, integrated floor-to-ceiling wardrobe with push-to-open matte black panels, oversized abstract canvas art with gold leaf detail. Palette: charcoal, black, white, warm taupe, brass accent.",
    "Minimalist": "polished pale concrete floors, pure white smooth matte walls with invisible baseboards, floor-to-ceiling seamless hidden wardrobe with push-to-open panels, no visible clutter on any surface. Furniture: ultra-low platform bed with minimal upholstered headboard in soft white linen, white bedding with a single textured ivory throw, one floating minimal nightstand, single architectural floor lamp with white shade, one small ceramic bonsai on floor, one large area rug in pure white wool covering most of the floor, zero decorative objects except one sculptural stone sphere. Palette: pure white, off-white, pale concrete, soft ivory.",
    "Japanese": "wide-plank warm bamboo floors, smooth warm white walls with one shoji-inspired translucent sliding panel in black wooden frame, soft diffused natural light. Furniture: ultra-low Japanese platform bed in dark lacquered wood with clean horizontal lines, white and light grey linen bedding, low dark lacquered wooden nightstand, akari-style paper lantern pendant light, large woven tatami area rug, single ikebana flower arrangement in ceramic vase on low wooden tray, floor zabuton cushion in muted clay tone, one tall indoor bamboo plant in stone pot. Palette: warm white, sand, clay, charcoal, deep forest green.",
    "Rustic": "wide reclaimed dark oak plank floors with visible grain and knots, whitewashed stone or brick accent wall, exposed rough-hewn dark ceiling beams. Furniture: massive solid reclaimed wood bed frame with tall rough-hewn headboard, layered white linen bedding with chunky cable-knit wool throw in oatmeal, distressed leather bench at foot of bed, large vintage woven jute area rug covering most of floor, wrought iron candelabra wall sconces, warm amber Edison filament bulb bedside lamps on reclaimed wood nightstands, artisanal terracotta pottery and raw stone objects on open shelving, vintage wooden ladder as decorative element. Palette: warm whites, oatmeal, dark oak, terracotta, rust.",
    "Industrial": "polished dark concrete floors with visible aggregate, exposed brick accent wall with aged patina, exposed ductwork and conduit piping on ceiling. Furniture: black welded steel bed frame with riveted details and dark leather upholstered headboard, white and dark grey bedding with distressed canvas throw, black steel-pipe open shelving unit with reclaimed wood planks, large dark charcoal area rug, oversized cage-style Edison filament pendant light, dark cognac leather tufted armchair, metal locker-style bedside table, vintage industrial wall clock, factory-style black steel crittall room divider. Palette: charcoal, gunmetal, rust orange, cognac, dark brick.",
    "Boho": "warm terracotta tiled floors with large vintage Persian rug in jewel tones layered on top, whitewashed plaster walls, abundant natural light with sheer embroidered curtains. Furniture: low wooden bed frame with tall woven rattan headboard, layered colorful boho bedding with suzani embroidered throw and tasseled cushions, rattan pendant light with fringe, large macramé wall hanging above bed, curved rattan armchair with thick cushion, abundant hanging potted plants (pothos and string of pearls), tall fiddle-leaf fig in woven basket, distressed wooden trunk as bench, moroccan leather pouf. Palette: terracotta, mustard yellow, burnt orange, sage green, warm whites.",
    "Super Luxury": "herringbone wide-plank white oak floors in satin finish, bespoke book-matched Calacatta Gold marble feature wall behind bed with dramatic gold and grey veining, custom Italian fluted wall paneling in soft greige with aged brass inlay trim, integrated warm LED strip lighting in crown molding and ceiling coves. Furniture: grand upholstered platform bed with tall channel-tufted velvet headboard in champagne or dove grey, premium white and ivory bedding with cashmere throw draped artfully, pair of sculptural brass bedside lamps on smoked glass and brass nightstands, grand multi-tier crystal chandelier, plush handwoven silk and wool area rug in ivory covering most of floor, large tufted velvet chaise lounge, floor-to-ceiling silk drapes in champagne on hidden motorized track, museum-quality oversized abstract oil painting in ornate aged brass frame, fresh white orchid arrangements in crystal vases. Palette: champagne, ivory, dove grey, aged brass, Calacatta gold.",
  };

  // ── ROOM TYPE MODIFIERS ────────────────────────────────────────────────────
  const roomTypeModifiers: Record<string, string> = {
    "bedroom": "This is a BEDROOM. It must contain: a large bed as the central focal point, nightstands on each side, bedside lighting, a rug under the bed, window treatments, and at least one accent chair or bench.",
    "living room": "This is a LIVING ROOM. It must contain: a large sofa as the central focal point, a coffee table, accent chairs, a large area rug anchoring the seating area, floor or table lamps, window treatments, and decorative objects on surfaces.",
    "kitchen": "This is a KITCHEN. It must contain: cabinetry, countertops, a kitchen island or peninsula if space allows, integrated appliances, pendant lighting over the island, a backsplash, and open or closed upper cabinets.",
    "dining room": "This is a DINING ROOM. It must contain: a large dining table as the central focal point, upholstered dining chairs, a statement pendant light or chandelier above the table, a sideboard or buffet, and a large area rug under the table.",
    "bathroom": "This is a BATHROOM. It must contain: a freestanding or built-in bathtub or large walk-in shower, vanity with basin, large format wall and floor tiles, a large mirror, towel rail, and elegant lighting.",
    "home office": "This is a HOME OFFICE. It must contain: a large desk as the central focal point, an ergonomic yet stylish chair, open shelving or built-in bookshelves, task lighting, and organized decorative storage.",
  };

  const roomKey = roomType.toLowerCase();
  const roomInstruction =
    Object.entries(roomTypeModifiers).find(([key]) =>
      roomKey.includes(key)
    )?.[1] ?? "";

  const interiorStyleDetails = interiorStyleModifiers[style] ?? "";

  const styleDetails = isExterior ? exteriorStyleDetails : "";

  if (isExterior) {
    return [
      `STRUCTURAL PRESERVATION REQUIRED: Keep ALL windows, doors, and architectural openings exactly as in the original photo — same position, size, quantity, and frame color. Preserve roofline, facade proportions, and all architectural elements completely unchanged.`,
      `Now redesign the exterior facade of this building into a stunning high-end ${style} style${styleDetails}.`,
      `REMOVE all existing ${elements} and REPLACE with luxurious ${style} equivalents.`,
      `Keep the exact same camera angle and perspective.`,
      `Result must look like a professional ${style} architectural photo shoot published in Architectural Digest: photorealistic, magazine-quality, ${lightingInstruction}, coherent natural shadows, no text, no watermark.`,
    ].join(" ");
  }

  return [
    `STRUCTURAL PRESERVATION REQUIRED: Keep ALL windows exactly as in the original photo — same quantity, same positions, same sizes, same frame color. Preserve the EXACT ceiling height and any ceiling details (coffers, moldings, beams). Preserve all walls, room corners, and floor layout completely unchanged. Do NOT simplify or remove any architectural feature.`,
    `${roomInstruction}`,
    `Now redesign this ${roomType} into a stunning high-end ${style} style interior using these exact elements: ${interiorStyleDetails}`,
    `Keep the exact same camera angle and perspective.`,
    `Result must look like a professional ${style} interior photo shoot published in Architectural Digest: photorealistic, magazine-quality, ${lightingInstruction}, coherent natural shadows, no text, no watermark.`,
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
      num_inference_steps: 40,
      output_format: "jpeg",
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
    const { buf, mime } = await callFalImageEdit({ imageFile: image, prompt, guidanceScale: isExteriorRoom ? 13 : 14 });

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