"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import clsx from "clsx";
import { useTheme } from "../components/ThemeProvider";

// --- Icons ---
const SunIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>;
const MoonIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const ShareIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>;
const DownloadIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const XIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

// --- Types ---
type UiItem = {
  id: string; createdAt: string; roomType: string; style: string;
  prompt: string; imageUrl: string; thumbUrl: string; isFavorite: boolean;
};

// --- Helpers ---
function isDirectUrl(v: string) {
  return v.startsWith("data:") || v.startsWith("http") || v.startsWith("blob:");
}

function getPublicUrl(supabase: any, path: string) {
  return supabase.storage.from("homeai").getPublicUrl(path).data.publicUrl;
}

async function forceDownload(url: string, filename = "homeai-design") {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    window.open(url, "_blank");
  }
}

const goldAccent = "#D4AF37";

export default function GalleryPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isDark, toggleTheme } = useTheme();

  const [items, setItems] = useState<UiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FUNÇÃO DE ABERTURA: Estado para controlar a imagem ampliada
  const [selectedImage, setSelectedImage] = useState<UiItem | null>(null);

  async function load() {
    setLoading(true); setErrorMsg(null);
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message); setLoading(false); return;
    }

    const mapped: UiItem[] = (data ?? []).map((r: any) => {
      const imageUrl = isDirectUrl(r.image_url) ? r.image_url : getPublicUrl(supabase, r.image_url);
      const thumbUrl = r.thumb_url ? (isDirectUrl(r.thumb_url) ? r.thumb_url : getPublicUrl(supabase, r.thumb_url)) : imageUrl;
      return {
        id: r.id, createdAt: r.created_at, roomType: r.room_type, style: r.style,
        prompt: r.prompt, imageUrl, thumbUrl, isFavorite: r.is_favorite,
      };
    });
    setItems(mapped); setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = showFavorites ? items.filter((x) => x.isFavorite) : items;

  async function toggleFavorite(id: string, next: boolean) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, isFavorite: next } : it)));
    await supabase.from("gallery_items").update({ is_favorite: next }).eq("id", id);
  }

  async function removeItem(item: UiItem) {
    if (!confirm("Are you sure you want to delete this design?")) return;
    setItems((p) => p.filter((x) => x.id !== item.id));
    await supabase.from("gallery_items").delete().eq("id", item.id);
    if (selectedImage?.id === item.id) setSelectedImage(null);
  }

  return (
    <div className={clsx("min-h-screen transition-colors duration-500 pb-32 pt-10 px-4", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-6xl">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <div className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border mb-4 shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-white border-zinc-200")}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: goldAccent }} />
              Gallery • Premium Collection
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Your Creations</h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowFavorites(!showFavorites)} className={clsx("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-sm", showFavorites ? "bg-[#D4AF37] border-transparent text-black" : (isDark ? "bg-white/5 border-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"))}>
              {showFavorites ? "★ Show All" : "☆ Favorites"}
            </button>
            <button onClick={toggleTheme} className={clsx("h-11 w-11 flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-sm", isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white hover:bg-zinc-100")}>
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">No designs found yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((it) => (
              <div key={it.id} className={clsx("group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500", isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-100 shadow-xl")}>

                {/* Image Container - AO CLICAR AQUI, ELA ABRE */}
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(it)}
                >
                  <img src={it.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  {/* Botão Favoritar permanece no card */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(it.id, !it.isFavorite); }}
                    className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-90 z-10"
                  >
                    {it.isFavorite ? "★" : "☆"}
                  </button>

                  <div className="absolute top-5 left-5">
                    <span className="px-3 py-1 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {it.style}
                    </span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{it.roomType || "Environment"}</p>
                    <p className="text-[11px] opacity-60 line-clamp-1 italic">"{it.prompt}"</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => forceDownload(it.imageUrl, `homeai-${it.id}`)} className={clsx("flex flex-col items-center gap-1 py-3 rounded-xl border transition-all active:scale-95", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                      <DownloadIcon className="h-3.5 w-3.5" />
                      <span className="text-[8px] font-black uppercase">Save</span>
                    </button>

                    <button onClick={() => navigator.share?.({ title: 'Home AI', url: it.imageUrl })} className={clsx("flex flex-col items-center gap-1 py-3 rounded-xl border transition-all active:scale-95", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                      <ShareIcon className="h-3.5 w-3.5" />
                      <span className="text-[8px] font-black uppercase">Share</span>
                    </button>

                    <button onClick={() => removeItem(it)} className={clsx("flex flex-col items-center gap-1 py-3 rounded-xl border border-red-500/20 text-red-500 transition-all active:scale-95", isDark ? "bg-red-500/5 hover:bg-red-500/10" : "bg-red-50 hover:bg-red-100")}>
                      <span className="text-[8px] font-black uppercase mt-4">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO (FULL SCREEN) --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botão de Fechar */}
          <button
            className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <XIcon className="h-6 w-6" />
          </button>

          {/* Imagem Ampliada (Sem Labels conforme pedido) */}
          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt="Enlarged design"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />

            {/* Ações rápidas dentro do Modal */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={() => forceDownload(selectedImage.imageUrl)}
                className="px-6 py-2 bg-[#D4AF37] text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}