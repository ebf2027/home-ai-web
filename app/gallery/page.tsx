"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import clsx from "clsx";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";

// --- Icons (Sistema Unificado) ---
function SparklesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14.5 9L21 10L16 14.5L17.5 21L12 18L6.5 21L8 14.5L3 10L9.5 9L12 3Z" fill="#3B82F6" />
      <path d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z" fill="#60A5FA" />
    </svg>
  );
}
const ShareIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>;
const DownloadIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const XIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const TrashIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;

// --- Menu Icons (Novos, iguais ao Figma) ---
function HomeIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function GalleryIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
}
function StarIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function UserIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}

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
    <div className={clsx("min-h-screen transition-colors duration-500 pb-32 pt-10 px-4 relative", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-6xl">

        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tighter flex items-center">
              <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
              <span className="text-blue-500">RenovAi</span>
              <SparklesIcon className="h-8 w-8 ml-1" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-white border-zinc-200")}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: goldAccent }} />
              Premium Collection
            </div>

            <button onClick={() => setShowFavorites(!showFavorites)} className={clsx("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-sm", showFavorites ? "bg-[#D4AF37] border-transparent text-black" : (isDark ? "bg-white/5 border-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"))}>
              {showFavorites ? "★ Show All" : "☆ Favorites"}
            </button>

            <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition-transform px-2">
              {isDark ? "☀️" : "🌙"}
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
              <div key={it.id} className={clsx(
                "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-1",
                isDark
                  ? "bg-zinc-900/40 border-white/5 hover:border-[#D4AF37]/30 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)]"
                  : "bg-white border-zinc-100 shadow-xl hover:shadow-2xl hover:border-[#D4AF37]/30"
              )}>

                {/* Image Container */}
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(it)}
                >
                  <img src={it.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(it.id, !it.isFavorite); }}
                    className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-90 z-10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                  >
                    {it.isFavorite ? "★" : "☆"}
                  </button>

                  <div className="absolute top-5 left-5">
                    <span className="px-3 py-1.5 bg-[#D4AF37]/90 backdrop-blur-sm text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-[#D4AF37]/20">
                      {it.style}
                    </span>
                  </div>
                </div>

                {/* Bottom Content - REFINADO */}
                <div className="p-6 flex flex-col justify-between h-[160px]">

                  {/* Textos (Placa de Museu) */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 text-[#D4AF37] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
                      {it.roomType || "Environment"}
                    </p>
                    <div className="relative pl-3 border-l-2 border-[#D4AF37]/30">
                      <p className="text-[12px] opacity-70 line-clamp-2 italic font-light leading-relaxed">
                        "{it.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Botões Minimalistas & Alinhados */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div className="flex gap-2 w-full">
                      <button onClick={() => forceDownload(it.imageUrl, `homeai-${it.id}`)} className={clsx("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all active:scale-95 group/btn", isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100")}>
                        <DownloadIcon className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-[#D4AF37] transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 group-hover/btn:opacity-100">Save</span>
                      </button>

                      <button onClick={() => navigator.share?.({ title: 'Home AI', url: it.imageUrl })} className={clsx("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all active:scale-95 group/btn", isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100")}>
                        <ShareIcon className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-[#D4AF37] transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 group-hover/btn:opacity-100">Share</span>
                      </button>
                    </div>

                    <button onClick={() => removeItem(it)} className={clsx("w-11 flex items-center justify-center py-2.5 rounded-xl border transition-all active:scale-95 group/del", isDark ? "bg-white/5 border-white/5 hover:bg-red-500/10 hover:border-red-500/20" : "bg-zinc-50 border-zinc-100 hover:bg-red-50 hover:border-red-200")}>
                      <TrashIcon className="h-4 w-4 opacity-30 group-hover/del:opacity-100 group-hover/del:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MENU FLUTUANTE (DOCK) --- */}
      <div className="hidden md:flex fixed bottom-6 md:bottom-2 left-0 right-0 z-[100] justify-center pointer-events-none">
        <nav className={clsx(
          "pointer-events-auto flex items-center justify-around gap-6 md:gap-10 px-6 py-4 shadow-2xl backdrop-blur-xl border border-white/10 transition-all",
          "rounded-[2rem]",
          "w-[90%] md:w-auto",
          isDark ? "bg-black/80" : "bg-white/90 border-zinc-200"
        )}>

          <Link href="/" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <HomeIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Home
            </span>
          </Link>

          <Link href="/gallery" className="flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all hover:-translate-y-1">
            <GalleryIcon className="h-6 w-6 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
              Gallery
            </span>
            <div className="h-1 w-1 bg-[#D4AF37] rounded-full absolute -bottom-1" />
          </Link>

          <Link href="/upgrade" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <StarIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Upgrade
            </span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <UserIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Profile
            </span>
          </Link>
        </nav>
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <XIcon className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt="Enlarged design"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />

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