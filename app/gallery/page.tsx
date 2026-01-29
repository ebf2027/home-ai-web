"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

type DbRow = {
  id: string;
  created_at: string;
  room_type: string;
  style: string;
  prompt: string;
  image_url: string;
  thumb_url: string | null;
  is_favorite: boolean;
};

type UiItem = {
  id: string;
  createdAt: string;
  roomType: string;
  style: string;
  prompt: string;

  imageUrl: string;
  thumbUrl: string;

  imagePath: string | null; // path do storage (userId/arquivo.jpg) quando aplicável
  thumbPath: string | null;

  isFavorite: boolean;
};

function isDirectUrl(v: string) {
  return v.startsWith("data:") || v.startsWith("http") || v.startsWith("blob:");
}

function getPublicUrl(supabase: any, path: string) {
  return supabase.storage.from("homeai").getPublicUrl(path).data.publicUrl;
}

async function forceDownload(url: string, filename = "homeai-image") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download image.");
  const blob = await res.blob();

  const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function GalleryPage() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<UiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const { data: udata, error: userErr } = await supabase.auth.getUser();
    if (userErr || !udata.user) {
      setLoading(false);
      setErrorMsg("You are not signed in.");
      return;
    }

    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, created_at, room_type, style, prompt, image_url, thumb_url, is_favorite")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    const mapped: UiItem[] = (data ?? []).map((r: DbRow) => {
      const imageUrl = isDirectUrl(r.image_url) ? r.image_url : getPublicUrl(supabase, r.image_url);

      const thumbValue = r.thumb_url ?? r.image_url;
      const thumbUrl = isDirectUrl(thumbValue) ? thumbValue : getPublicUrl(supabase, thumbValue);

      return {
        id: r.id,
        createdAt: r.created_at,
        roomType: r.room_type,
        style: r.style,
        prompt: r.prompt,
        imageUrl,
        thumbUrl,
        imagePath: isDirectUrl(r.image_url) ? null : r.image_url,
        thumbPath: r.thumb_url && !isDirectUrl(r.thumb_url) ? r.thumb_url : null,
        isFavorite: r.is_favorite,
      };
    });

    setItems(mapped);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = showFavorites ? items.filter((x) => x.isFavorite) : items;

  async function toggleFavorite(id: string, next: boolean) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, isFavorite: next } : it)));

    const { error } = await supabase.from("gallery_items").update({ is_favorite: next }).eq("id", id);
    if (error) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, isFavorite: !next } : it)));
      setErrorMsg(error.message);
    }
  }

  // ✅ DELETE PROFISSIONAL:
  // 1) busca os paths diretamente do DB (sem adivinhar por URL)
  // 2) apaga do Storage
  // 3) apaga do DB
  async function removeItem(item: UiItem) {
    const prevItems = items;
    setItems((p) => p.filter((x) => x.id !== item.id));
    setErrorMsg(null);

    // 1) pega do DB os paths reais (garantido)
    const { data: row, error: selErr } = await supabase
      .from("gallery_items")
      .select("image_url, thumb_url")
      .eq("id", item.id)
      .single();

    if (selErr) {
      setItems(prevItems);
      setErrorMsg("Failed to read item before delete: " + selErr.message);
      return;
    }

    const paths = [row?.image_url, row?.thumb_url]
      .filter(Boolean)
      .filter((p: string) => typeof p === "string" && !isDirectUrl(p)) as string[];

    // remove duplicados
    const uniquePaths = Array.from(new Set(paths));

    // 2) delete do Storage (somente se tiver paths)
    if (uniquePaths.length) {
      const { error: stErr } = await supabase.storage.from("homeai").remove(uniquePaths);
      if (stErr) {
        setItems(prevItems);
        setErrorMsg("Storage delete failed: " + stErr.message);
        return;
      }
    }

    // 3) delete do DB
    const { error: dbErr } = await supabase.from("gallery_items").delete().eq("id", item.id);
    if (dbErr) {
      setItems(prevItems);
      setErrorMsg("DB delete failed: " + dbErr.message);
      return;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Gallery</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites((v) => !v)}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            {showFavorites ? "Show all" : "Favorites"}
          </button>

          <button onClick={load} className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-neutral-500">Loading...</p>}

      {errorMsg && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
      )}

      {!loading && !errorMsg && filtered.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No images yet.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((it) => (
          <div key={it.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <button onClick={() => window.open(it.imageUrl, "_blank")} className="block w-full" title="Open">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.thumbUrl} alt="" className="h-44 w-full object-cover md:h-52" />
            </button>

            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-neutral-500">{it.roomType || "Room"}</p>
                  <p className="truncate text-sm font-medium">{it.style || "Style"}</p>
                </div>

                <button
                  onClick={() => toggleFavorite(it.id, !it.isFavorite)}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                  title="Favorite"
                >
                  {it.isFavorite ? "★" : "☆"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => forceDownload(it.imageUrl, `homeai-${it.id}`)}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  Download
                </button>

                <button
                  onClick={() => removeItem(it)}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  Delete
                </button>
              </div>

              <div className="text-[11px] text-neutral-400">{new Date(it.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
