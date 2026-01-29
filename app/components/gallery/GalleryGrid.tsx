"use client";

import { resolveImageSrc } from "@/app/lib/resolveImageSrc";
import type { GalleryItem } from "../../types/gallery";

export function GalleryGrid({
  items,
  onOpen,
  onToggleFavorite,
  onDownload,
}: {
  items: GalleryItem[];
  onOpen: (item: GalleryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (item: GalleryItem) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="text-lg font-semibold">Sem imagens ainda</div>
        <div className="mt-1 text-sm text-gray-500">
          Gere sua primeira imagem e ela vai aparecer aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => {
        const anyIt = it as any;

        const imgPath =
          anyIt.thumb_url ??
          anyIt.thumbUrl ??
          anyIt.image_url ??
          anyIt.imageUrl ??
          "";

        const isFav = anyIt.isFavorite ?? anyIt.is_favorite ?? false;

        return (
          <div
            key={anyIt.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <button onClick={() => onOpen(it)} className="block w-full">
              <img
                src={resolveImageSrc(imgPath)}
                alt={anyIt.prompt ?? "Imagem gerada"}
                className="h-44 w-full object-cover md:h-52"
                loading="lazy"
              />
            </button>

            <div className="flex items-center justify-between gap-2 p-2">
              <button
                onClick={() => onToggleFavorite(anyIt.id)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold"
                title="Favoritar"
              >
                {isFav ? "★" : "☆"}
              </button>

              <button
                onClick={() => onDownload(it)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold"
                title="Download"
              >
                ⤓
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
