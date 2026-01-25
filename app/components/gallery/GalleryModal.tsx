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
        className="absolute inset-0 bg-black/60"
        aria-label="Fechar"
      />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
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
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              {item.isFavorite ? "★ Favorito" : "☆ Favoritar"}
            </button>

            <button
              onClick={() => onDownload(item)}
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="bg-black">
          <img
            src={item.imageUrl}
            alt={item.prompt ?? "Imagem gerada"}
            className="max-h-[75vh] w-full object-contain"
          />
        </div>

        {item.prompt ? (
          <div className="border-t p-4">
            <div className="text-xs font-semibold text-gray-600">Prompt</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
              {item.prompt}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
