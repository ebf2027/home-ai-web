"use client";

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
      {items.map((it) => (
        <div
          key={it.id}
          className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm"
        >
          <button onClick={() => onOpen(it)} className="block w-full" title="Abrir">
            <img
              src={it.thumbUrl}
              alt={it.prompt ?? "Imagem gerada"}
              className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] md:h-52"
              loading="lazy"
            />
          </button>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">
                {it.roomType ? `${it.roomType}` : "Ambiente"}
                {it.style ? ` • ${it.style}` : ""}
              </div>
              <div className="text-[11px] text-white/80">
                {new Date(it.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="pointer-events-auto flex gap-2">
              <button
                onClick={() => onToggleFavorite(it.id)}
                className="rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold shadow-sm hover:bg-white"
                title="Favoritar"
              >
                {it.isFavorite ? "★" : "☆"}
              </button>

              <button
                onClick={() => onDownload(it)}
                className="rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold shadow-sm hover:bg-white"
                title="Download"
              >
                ⤓
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
