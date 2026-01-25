import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STYLE_RECIPES: Record<string, string> = {
  Modern: `
- Materials: smooth matte walls, microcement or wide-plank oak floor, black metal accents.
- Palette: neutral (white/gray/black) with 1 subtle accent color.
- Furniture: clean lines, low-profile sofa, minimal decor.
- Lighting: recessed/track lights, modern pendant, crisp contrast.
`,
  Minimalist: `
- Materials: very plain surfaces, light oak or pale microcement floor, NO clutter.
- Palette: soft whites, warm beige, very low contrast.
- Furniture: fewer pieces, ultra-simple shapes, hidden storage, empty surfaces.
- Lighting: soft, even, natural, minimal fixtures.
`,
  Scandinavian: `
- Materials: light oak floor, white walls, cozy textiles (wool/linen), natural wood.
- Palette: bright whites + light gray + warm wood.
- Furniture: airy, functional, rounded edges, hygge feel.
- Lighting: warm natural light, simple pendant lamps.
`,
  Rustic: `
- Materials: rustic wood planks floor, textured plaster walls, reclaimed wood, wrought iron.
- Palette: warm earthy tones (brown/cream/terracotta).
- Furniture: chunkier wood furniture, handcrafted feel, natural textures.
- Lighting: warm, cozy, slightly dimmer, vintage lamps.
`,
  Industrial: `
- Materials: polished concrete floor OR dark wood, brick/concrete wall texture, exposed metal.
- Palette: charcoal/gray/black with warm wood accents.
- Furniture: metal frames, leather details, utilitarian shelves.
- Lighting: exposed bulbs, track lighting, strong shadows (but still realistic).
`,
  Boho: `
- Materials: warm wood floor, layered rugs, woven textures, rattan, macrame.
- Palette: warm neutrals + earthy accents (sage/terracotta).
- Furniture: eclectic pieces, plants, cozy layered styling.
- Lighting: warm ambient, lanterns, natural materials.
`,
};

function normalizeStyle(input: string) {
  const s = (input ?? "").trim();
  return STYLE_RECIPES[s] ? s : "Modern";
}

const MAX_IMAGE_MB = 25;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const OPENAI_TIMEOUT_MS = 60_000;

// tenta novamente quando for erro temporário
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 2; // total: 1 tentativa + 2 retries = 3 tentativas

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeReadJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const style = normalizeStyle(form.get("style")?.toString() ?? "Modern");
    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ ok: false, error: "No image received." }, { status: 400 });
    }

    if (typeof image.size === "number" && image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `Image too large. Max allowed is ${MAX_IMAGE_MB}MB.` },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const recipe = STYLE_RECIPES[style] ?? STYLE_RECIPES.Modern;

    const prompt = `
Preserve the original room layout, proportions, and architectural structure exactly as in the input image.
Do NOT move, remove, resize, or relocate walls, ceiling, window positions and sizes, door position and size, or camera angle.
The door and windows must remain clearly visible in their original locations.

Refine and enhance the existing room to look clean, organized, and aesthetically pleasing,
while remaining realistic, achievable, and faithful to the original space.
Improve organization, material quality, color harmony, furniture alignment, and visual balance.
Do not redesign the room or invent new architectural elements.

The door must remain in the same position and size, but its design, color, and finish may be updated to match the selected style.
The floor layout must remain unchanged, but the floor material, texture, and color may be upgraded to match the selected style.

Use natural, realistic daylight consistent with the window positions.
Avoid dramatic or cinematic lighting.

Interior design style: ${style}

Style recipe:
${recipe}
`.trim();

    const out = new FormData();
    out.append("model", "gpt-image-1-mini");
    out.append("prompt", prompt);
    out.append("size", "auto");
    out.append("output_format", "jpeg");
    out.append("quality", "medium");
    out.set("image", image, image.name || "room.jpg");

    let lastStatus = 500;
    let lastData: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

      let resp: Response;
      try {
        resp = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: out,
          signal: controller.signal,
        });
      } catch (e: any) {
        clearTimeout(t);

        // timeout ou erro de rede: tenta de novo
        if (attempt < MAX_RETRIES) {
          await sleep(500 * (attempt + 1)); // 500ms, 1000ms, ...
          continue;
        }

        if (e?.name === "AbortError") {
          return NextResponse.json(
            { ok: false, error: "OpenAI request timed out. Please try again." },
            { status: 504 }
          );
        }

        return NextResponse.json(
          { ok: false, error: "Network error calling OpenAI. Please try again." },
          { status: 502 }
        );
      } finally {
        clearTimeout(t);
      }

      const data = await safeReadJson(resp);
      lastStatus = resp.status;
      lastData = data;

      // sucesso
      if (resp.ok) {
        const b64 = data?.data?.[0]?.b64_json;
        if (!b64) {
          return NextResponse.json(
            { ok: false, error: "No image returned by OpenAI.", details: data ?? null },
            { status: 502 }
          );
        }

        const buffer = Buffer.from(b64, "base64");
        return new Response(buffer, {
          status: 200,
          headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
        });
      }

      // se for erro temporário, tenta de novo
      if (RETRYABLE_STATUS.has(resp.status) && attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1));
        continue;
      }

      // erro final: devolve status mais fiel (ex.: 503 quando indisponível)
      const msg =
        data?.error?.message ??
        `OpenAI request failed (status ${resp.status}).`;

      const statusToReturn = resp.status === 503 ? 503 : 500;

      return NextResponse.json(
        { ok: false, error: msg, details: data ?? null },
        { status: statusToReturn }
      );
    }

    // fallback (não deveria chegar aqui)
    const msg = lastData?.error?.message ?? `OpenAI request failed (status ${lastStatus}).`;
    const statusToReturn = lastStatus === 503 ? 503 : 500;

    return NextResponse.json(
      { ok: false, error: msg, details: lastData ?? null },
      { status: statusToReturn }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
