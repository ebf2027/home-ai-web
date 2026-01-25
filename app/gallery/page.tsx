"use client";

import { GALLERY_LS_KEY } from "../lib/galleryStorage";
import { useEffect, useMemo, useState } from "react";
import { GalleryGrid } from "../components/gallery/GalleryGrid";
import { GalleryModal } from "../components/gallery/GalleryModal";
import type { GalleryItem } from "../types/gallery";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [onlyFav, setOnlyFav] = useState(false);

  // ✅ Carrega do localStorage quando abrir a Gallery
  useEffect(() => {
    const saved = localStorage.getItem(GALLERY_LS_KEY);
    if (!saved) {
      setItems([]);
      return;
    }
    try {
      setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, []);

  // ✅ Toda vez que favoritar/desfavoritar, salvamos no localStorage
  function toggleFavorite(id: string) {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
      );
      localStorage.setItem(GALLERY_LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function downloadImage(item: GalleryItem) {
    fetch(item.imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `design-${item.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  const visibleItems = useMemo(() => {
    if (!onlyFav) return items;
    return items.filter((i) => i.isFavorite);
  }, [items, onlyFav]);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gallery</h1>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyFav}
              onChange={(e) => setOnlyFav(e.target.checked)}
            />
            Favoritos
          </label>
        </div>

        <GalleryGrid
          items={visibleItems}
          onOpen={setActive}
          onToggleFavorite={toggleFavorite}
          onDownload={downloadImage}
        />
      </div>

      <GalleryModal
        item={active}
        onClose={() => setActive(null)}
        onToggleFavorite={toggleFavorite}
        onDownload={downloadImage}
      />
    </main>
  );
}
