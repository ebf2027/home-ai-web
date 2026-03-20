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

  // ─── EXTERIOR ────────────────────────────────────────────────────────────────
  if (isExterior) {
    const exteriorModifiers: Record<string, string> = {
      "Modern":
        "iconic contemporary architecture, cantilevered concrete structures, seamless floor-to-ceiling glass walls, ultra-sharp geometric precision, luxury villa aesthetic",
      "Minimalist":
        "museum-grade architectural minimalism, monolithic pure white surfaces, shadow-gap details, hidden frames, ethereal and clean geometric form",
      "Scandinavian":
        "architectural Nordic masterpiece, premium vertical light wood slats, smooth off-white stucco, oversized panoramic windows, warm hygge luxury exterior",
      "Japanese":
        "contemporary Zen architecture, charred wood (Shou Sugi Ban) elements, delicate timber screening, minimalist stone integration, serene and high-end aesthetic",
      "Rustic":
        "high-end Alpine-inspired luxury estate, hand-cut mountain stone walls, massive reclaimed oak beams, artisanal textured lime wash, timeless heritage prestige",
      "Industrial":
        "luxury industrial loft facade, weathered steel accents, premium charcoal grey brickwork, massive black steel crittall windows, raw yet refined architectural textures",
      "Boho":
        "Mediterranean luxury boho villa, hand-plastered soft cream walls, organic wooden textures, raffia and stone accents, relaxed high-end coastal atmosphere",
      "Super Luxury":
        "ultra-exclusive billionaire mansion facade, book-matched marble panels, expansive seamless structural glass, integrated architectural LED linear lighting, reflecting pools, the pinnacle of prestige",
    };

    const styleDetail = exteriorModifiers[style]
      ? `, with a specific focus on highlighting ${exteriorModifiers[style]}`
      : "";

    return [
      `Completely redesign this house facade into a stunning high-end ${style} style exterior architecture${styleDetail}.`,
      `REMOVE all existing facade materials, finishes, textures, and outdoor lighting entirely and REPLACE them with luxurious ${style} style equivalents.`,
      `Keep the exact same camera angle, perspective, and building structure.`,
      `CRITICAL: DO NOT move, remove, resize, or alter doors, windows, or any architectural openings. Keep ALL existing windows and doors EXACTLY as they appear in the original photo — same size, same position, same quantity.`,
      `Preserve all architectural proportions and spatial structure — only redesign the facade, materials, and finishes.`,
      `Result must look like a professional ${style} exterior architecture photo shoot published in Architectural Digest: photorealistic, magazine-quality, bright clear natural daylight, coherent natural shadows, no text, no watermark.`,
    ].join(" ");
  }

  // ─── INTERIOR ────────────────────────────────────────────────────────────────

  // Rich style atmosphere (materials, palette, lighting, decor objects — NO room-specific furniture)
  const styleAtmosphere: Record<string, string> = {
    "Modern":
      "sleek low-profile furniture with clean geometric lines in matte charcoal or warm taupe, a high-gloss lacquered accent wall or textured 3D wall panels, bold geometric shapes with brass or black metal hardware throughout, recessed LED perimeter lighting with warm white temperature bathing the ceiling in a soft glow, large-format polished porcelain tiles or seamless resin floors in concrete grey, a monochromatic palette of grey, black, and white with a single bold jewel-tone accent (emerald, sapphire, or burnt orange) in cushions or a statement object, an oversized abstract canvas art with gold leaf details on the main wall, a sculptural designer pendant light, floor-to-ceiling motorized blackout curtains on a hidden track, and integrated hidden storage with push-to-open mechanisms throughout",
    "Minimalist":
      "only essential furniture with razor-sharp immaculate lines and a weightless visual presence, pure white smooth matte walls with invisible shadow-gap baseboards, floor-to-ceiling seamless hidden storage with push-to-open mechanisms and no visible handles anywhere, completely uncluttered empty surfaces with deliberate strategic negative space throughout, simple organic linen or cotton textiles in monochrome white or the softest warm grey, a single museum-quality sculptural focal-point object — either a smooth stone sphere, a matte ceramic vessel, or a perfectly shaped bonsai tree — placed with intention, invisible recessed lighting in deep ceiling coves creating a floating light effect, low-profile furniture with clean integrated surfaces and no ornamentation, and polished concrete or pale wide-plank oak floors with no visible grout lines",
    "Scandinavian":
      "ultra-refined Scandinavian and contemporary minimal luxury atmosphere, bathed in soft, diffused natural daylight from grand expansive floor-to-ceiling black-framed Crittall-style windows and warm recessed cove ceiling lighting, featuring light oak surfaces and fine linen or bouclé upholstery throughout. A grand rustic heavily textured organic ceramic floor vase holds a massive magnificent arrangement of fluffy pampas grass plumes. A large mature olive tree in a textured terracotta pot stands nearby. A single elegant minimalist line-art abstract drawing in a natural wood frame hangs on the main wall. A minimal full-length mirror leans against a wall. Sheer linen curtains are drawn softly over the windows. A textured natural area rug covers the light wood floor. The palette is white, ivory, warm beige, and soft oat, with touches of natural terracotta and sage",
    "Japanese":
      "ultra-serene contemporary Zen atmosphere with ultra-low minimalist furniture featuring clean horizontal lines and absolutely no visible hardware, shoji-inspired translucent sliding panels with black wooden frames elegantly dividing the space, a warm natural bamboo accent wall or woven tatami mat flooring area, river stones and white gravel zen garden elements arranged in a rectangular ceramic tray as a centrepiece, muted wabi-sabi earth tones throughout — sand, raw clay, charcoal — with a single deep moss green and forest accent, lacquered black wooden furniture pieces with precise craftsmanship, traditional paper lantern pendant lights (akari-style) casting a warm diffused glow, a serene uncluttered Zen composition anchored by a single refined ikebana flower arrangement in a handmade ceramic vase, sliding fusuma doors with subtle hand-painted nature motifs, and a natural linen or cotton flat-weave area rug on the floor",
    "Rustic":
      "deeply warm and characterful high-end rustic farmhouse atmosphere with massive solid reclaimed barn wood surfaces showing visible grain, natural knots, and authentic weathering, hand-forged wrought iron hardware and vintage blackened metal fixtures throughout, exposed rough-hewn dark wood ceiling beams with visible saw marks and natural imperfections overhead, warm amber Edison filament bulb chandeliers hanging on black iron chains from the ceiling, layered natural textiles including a chunky cable-knit wool throw, aged distressed leather upholstery, and linen fabrics in oatmeal and cream, artisanal terracotta pottery and raw river stone accents arranged on open wooden shelving, a whitewashed brick or rough-hewn stone accent wall as the focal point, a vintage hand-woven jute area rug covering the floor, antique wooden ladders repurposed as decorative display elements leaning against walls, wrought iron candelabra wall sconces flickering with warm light, and antique glass or galvanised metal pendant lights",
    "Industrial":
      "raw, gritty, yet refined luxury industrial loft atmosphere with a full exposed red brick accent wall showing aged mortar texture and a rich patina, black steel-pipe open shelving with thick reclaimed wood plank shelves and welded metal-frame furniture with visible rivet details, a dark palette of charcoal, gunmetal grey, and matte black with deliberate rust orange and aged copper accents, oversized cage-style Edison filament pendant lights hanging on fabric-wrapped black cords from an exposed ceiling, dark distressed cognac leather tufted seating or a wingback chair as a statement piece, riveted metal furniture pieces with visible weld seams celebrating industrial craft, factory-style black steel Crittall windows or room dividers as a signature architectural element, polished concrete floors with visible aggregate and a subtle sheen, exposed steel ductwork and conduit piping running deliberately across the raw ceiling, metal locker-style storage units as accent furniture, and a reclaimed factory cart or trolley repurposed as a decorative side table",
    "Boho":
      "rich, layered, and free-spirited bohemian luxury atmosphere with an oversized hand-knotted macramé wall hanging as the dominant focal statement, multiple layers of colorful vintage Persian and Turkish kilim rugs in deep jewel tones — ruby, sapphire, and emerald — overlapping across the floor, curved natural rattan and wicker furniture pieces with tactile texture alongside low solid wood elements, an abundance of hanging potted plants — trailing pothos, string-of-pearls, and a tall statement fiddle-leaf fig tree in a terracotta pot, a warm earthy palette of terracotta, dusty mustard yellow, burnt orange, and sage green throughout, eclectic global textiles including suzani embroidered cushions, a Moroccan wedding blanket (handira), and Indian hand block-print cotton throws layered generously, oversized rattan pendant lights with natural fibre tassels hanging from the ceiling, vintage distressed wooden trunks and eclectic furniture pieces in different woods and finishes, floor cushions and Moroccan hand-stitched leather poufs clustered together, hand-carved wooden screens or decorative room dividers, and trailing string fairy lights creating a warm intimate glow",
    "Super Luxury":
      "supremely opulent and exclusive super luxury atmosphere with a bespoke book-matched Calacatta Gold marble feature wall with dramatic sweeping gold and grey veining in a mirror-polished high-gloss finish, custom Italian boiserie wall paneling in soft warm greige with precision-routed fluted vertical channels and aged brass inlay trim details, hand-stitched deep channel-tufted velvet upholstered furniture in the most sophisticated neutrals — champagne, soft dove grey, or warm sand beige — with brushed brass leg details, a grand multi-tier crystal chandelier with cascading hand-cut faceted prisms in an aged brass frame hanging as a centrepiece, a plush hand-woven silk-and-wool area rug in ivory or warm taupe covering most of the floor with a subtle architectural geometric pattern, statement designer furniture pieces including a dramatically curved velvet sofa, a sculptural leather lounge chair, and smoked glass surfaces on polished brass legs, floor-to-ceiling champagne or greige silk drapes with a concealed motorized track system and blackout lining, herringbone or chevron wide-plank white oak floors in a satin finish, a museum-quality large-scale black-and-white fine art photography print or impasto abstract oil painting in an ornate aged brass frame, fresh white phalaenopsis orchid arrangements in hand-blown crystal vases, integrated smart lighting with warm LED strips concealed in crown molding coves, a floating linear designer fireplace with a backlit white onyx or alabaster surround, precision architectural crown molding and coffered ceiling details, leather-wrapped decorative trays with art and design coffee table books, and a cashmere throw draped artfully",
  };

  // Room-specific furniture and layout — these override the generic elements in the style prompt
  const roomElements: Record<string, string> = {
    "Living Room":
      "The room must be a living room. It must contain: a large plush sofa with coordinating accent armchairs arranged around a substantial statement coffee table, a sculptural designer floor lamp, an oversized framed artwork as the focal point on the main wall, generously filled decorative cushions and a throw blanket on the sofa, a curated bookshelf or built-in display unit with books and objects, a side table with a designer table lamp, and a large area rug anchoring the entire seating group. There must be NO bed, NO bedroom furniture.",
    "Bedroom": "This is a bedroom. It must contain a grand fully upholstered luxury platform bed as the absolute centrepiece — with a tall generously padded fabric headboard in premium bouclé or fine linen in warm ivory or soft oat, on a solid low-profile upholstered base (NOT raw wood). The bed is dressed in multiple layers of premium bedding: crisp white Egyptian cotton sheets, a plush waffle-knit or jacquard duvet cover, at least four oversized pillows in white and ivory in mixed textures (linen, bouclé, cotton), and a chunky-knit or waffle-weave throw casually folded at the foot. Two matching bedside nightstands flank the bed, each with a ceramic lamp and a stack of books. A cozy oversized cream bouclé teddy-style luxury lounge armchair sits in a free corner away from any windows or doors. A full-length mirror leans against a solid wall only. CRITICAL: Do NOT place any furniture, wardrobes, shelving, or any object in front of, blocking, or overlapping any window, door, or glass opening. All windows and glass doors must remain fully visible and unobstructed. NO sofa, NO dining table, NO kitchen elements.",
    "Kitchen":
      "The room must be a kitchen. It must contain: full custom cabinetry with coordinated doors in the style's palette, a large central kitchen island with designer bar stools, premium stone or solid surface countertops, professional-grade appliances integrated flush into the cabinetry, open shelves displaying curated ceramics and glassware, a series of statement pendant lights above the island, and a designer faucet with an undermount sink. There must be NO bed, NO sofa, NO bedroom or living room furniture.",
    "Bathroom":
      "The room must be a bathroom. It must contain: either a freestanding sculptural bathtub as the hero piece or a large walk-in rain shower with a frameless glass enclosure, a double vanity with designer vessel or undermount sinks and premium fixtures, large-format wall and floor tiles, floating wall-hung cabinetry with ample storage, a large backlit frameless mirror or illuminated vanity mirror, neatly folded fluffy towels, decorative candles and a ceramic soap dispenser, and a potted plant. There must be NO bed, NO sofa, NO kitchen or living room elements.",
    "Home Office":
      "The room must be a home office. It must contain: a large solid executive or designer desk as the centrepiece with a premium ergonomic or designer chair, integrated floating shelves above or beside the desk with neatly organized books and curated decorative objects, a designer task lamp and monitor setup, a small reading armchair in the corner, a framed artwork or a curated gallery wall, discreet cable management, and a large area rug defining and anchoring the workspace. There must be NO bed, NO kitchen island, NO dining table.",
    "Dining Room":
      "The room must be a dining room. It must contain: a large rectangular or round dining table seating six to eight people as the centrepiece, matching upholstered dining chairs around the table, a dramatic sculptural chandelier or series of pendant lights centered precisely above the table, a sideboard or credenza along one wall with decorative objects and glassware displayed on top, a large framed mirror or statement artwork on the wall, a floral or candle centrepiece on the table, and a textured area rug anchoring the table and chairs. There must be NO bed, NO sofa, NO kitchen island.",
    "Kids Room":
      "The room must be a kids bedroom. It must contain: a sturdy single bed or bunk bed with playful coordinated bedding as the main element, a functional study desk with a chair and a task light, ample storage for toys and books using open cubbies, painted shelves, and wicker baskets, a colorful and soft area rug covering most of the floor, framed fun or educational wall art and decorative wall elements, a small table and chairs set for crafts and play, and soft cheerful wall colors appropriate for a child. There must be NO adult furniture, NO kitchen or dining elements.",
    "Laundry Room":
      "The room must be a laundry room. It must contain: a pair of front-load washer and dryer on pedestals or integrated under a continuous counter, full upper and lower cabinetry for organized storage, a long generous countertop for sorting and folding laundry, a deep utility sink with a designer faucet, open shelves with neatly arranged laundry products in matching glass or ceramic containers, a hanging rod or wall-mounted drying rack for air-drying garments, and a durable patterned tile or luxury vinyl plank floor. There must be NO bed, NO sofa, NO kitchen or dining elements.",
  };

  const atmosphereDesc =
    styleAtmosphere[style] ??
    `a high-end ${style} style atmosphere with premium materials, curated decor, and sophisticated lighting`;

  const roomKey =
    Object.keys(roomElements).find(
      (k) => k.toLowerCase() === roomType.toLowerCase()
    ) ?? roomType;

  const roomDesc =
    roomElements[roomKey] ??
    `The room must be a ${roomType}. It must contain all furniture and decor elements appropriate and essential for a ${roomType}, arranged in a cohesive, functional, and luxurious layout. Include only furniture that belongs in a ${roomType}.`;

  return [
    `CRITICAL ROOM TYPE INSTRUCTION: This image must show a ${roomType} and nothing else. Do not generate a bedroom if the target is a living room. Do not generate a living room if the target is a kitchen. Generate ONLY a ${roomType}.`,
    `Completely redesign this ${roomType} into a stunning high-end ${style} style interior.`,
    `${roomDesc}`,
    `The overall atmosphere, materials, palette, lighting, and decorative objects of this ${roomType} must reflect: ${atmosphereDesc}.`,
    `REMOVE all existing furniture, decor, materials, textures, colors, and lighting entirely and REPLACE them with luxurious ${style} equivalents appropriate for a ${roomType}.`,
    `Keep the exact same camera angle, perspective, room structure, walls, ceiling height, and floor layout.`,
    `CRITICAL: DO NOT move, remove, resize, or alter doors, windows, or any architectural openings. Keep ALL existing windows and doors EXACTLY as they appear in the original photo — same size, same position, same quantity. Do not convert windows into doors or doors into windows.`,
    `Preserve all architectural proportions and spatial structure — only redesign the interior design, furniture, materials, and finishes.`,
    `Result must look like a professional ${style} interior photo shoot of a ${roomType} published in Architectural Digest: photorealistic, magazine-quality, warm soft natural light flooding the ${roomType}, coherent natural shadows, no text, no watermark.`,
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