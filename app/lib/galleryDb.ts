"use client";

import { createClient } from "@/app/lib/supabase/client";

type SaveArgs = {
  id?: string;
  roomType: string;
  style: string;
  prompt: string;
  imageUrl: string; // dataURL (base64) ou http/blob
  thumbUrl?: string | null; // dataURL (base64) ou http/blob (opcional)
};

async function urlToBlob(url: string): Promise<{ blob: Blob; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image.");
  const blob = await res.blob();
  const contentType = blob.type || "image/jpeg";
  return { blob, contentType };
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const [meta, b64] = dataUrl.split(",");
  const contentType = meta.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

async function makeThumbFromDataUrl(dataUrl: string, maxSide = 420): Promise<Blob> {
  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image for thumbnail"));
  });

  const { width, height } = img;
  const scale = Math.min(maxSide / width, maxSide / height, 1);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create thumb blob"))),
      "image/jpeg",
      0.82
    );
  });

  return blob;
}

export async function saveToSupabaseGallery(args: SaveArgs) {
  const supabase = createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) throw new Error("Not signed in.");

  // 1) FULL blob
  let fullBlob: Blob;
  let fullType = "image/jpeg";

  if (args.imageUrl.startsWith("data:")) {
    const r = dataUrlToBlob(args.imageUrl);
    fullBlob = r.blob;
    fullType = r.contentType;
  } else {
    const r = await urlToBlob(args.imageUrl);
    fullBlob = r.blob;
    fullType = r.contentType;
  }

  // 2) THUMB blob (se não vier, gera a partir do dataURL)
  let thumbBlob: Blob;

  if (args.thumbUrl && args.thumbUrl.startsWith("data:")) {
    thumbBlob = dataUrlToBlob(args.thumbUrl).blob;
  } else if (args.thumbUrl && !args.thumbUrl.startsWith("data:")) {
    thumbBlob = (await urlToBlob(args.thumbUrl)).blob;
  } else {
    // gera thumb só se imageUrl for dataURL (para usar canvas)
    if (!args.imageUrl.startsWith("data:")) {
      // fallback simples: usa o fullBlob como thumb (não quebra)
      thumbBlob = fullBlob;
    } else {
      thumbBlob = await makeThumbFromDataUrl(args.imageUrl);
    }
  }

  // 3) Paths
  const itemId =
    args.id ??
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const fullExt =
    fullType.includes("png") ? "png" : fullType.includes("webp") ? "webp" : "jpg";

  const basePath = `${user.id}/${itemId}`;
  const fullPath = `${basePath}/final.${fullExt}`;
  const thumbPath = `${basePath}/thumb.jpg`;

  // 4) Upload FULL
  const up1 = await supabase.storage.from("homeai").upload(fullPath, fullBlob, {
    contentType: fullType,
    upsert: false,
  });
  if (up1.error) throw new Error(up1.error.message);

  // 5) Upload THUMB
  const up2 = await supabase.storage.from("homeai").upload(thumbPath, thumbBlob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (up2.error) throw new Error(up2.error.message);

  // 6) Insert DB (só PATHS)
  const { error: insErr } = await supabase.from("gallery_items").insert({
    id: itemId,
    user_id: user.id,
    room_type: args.roomType,
    style: args.style,
    prompt: args.prompt,
    image_url: fullPath,
    thumb_url: thumbPath,
    is_favorite: false,
  });

  if (insErr) throw new Error(insErr.message);

  return { id: itemId, imagePath: fullPath, thumbPath };
}
