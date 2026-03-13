"use client";

import { useEffect } from "react";
import type { GalleryItem } from "../../types/gallery";

export function GalleryModal({
  item,
  onClose,
  onToggleFavorite,
  onDownload,
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (item: GalleryItem) => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        aria-label="Fechar"
      />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4 bg-[#0A0A0A]">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {item.roomType ?? "Ambiente"}
              {item.style ? ` • ${item.style}` : ""}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
            >
              {item.isFavorite ? "★ Favorito" : "☆ Favoritar"}
            </button>

            <button
              onClick={() => onDownload(item)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="bg-black flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.prompt ?? "Imagem gerada"}
            className="max-h-[85vh] w-full object-contain" 
          />
        </div>

        {item.prompt ? (
          <div className="border-t border-white/10 p-4 bg-[#0A0A0A]">
            <div className="text-xs font-semibold text-gray-500">Prompt</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-gray-300">
              {item.prompt}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}