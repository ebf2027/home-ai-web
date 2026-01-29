// app/lib/storageImages.ts

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

export async function makeThumbBlob(dataUrl: string, maxSide = 420): Promise<Blob> {
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
  if (!ctx) throw new Error("Canvas 2D context not available");

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
