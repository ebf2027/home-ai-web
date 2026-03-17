"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import clsx from "clsx";
import { useTheme } from "../components/ThemeProvider";
import Link from "next/link";
import { SparklesIcon, ShareIcon, DownloadIcon, XIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon, GalleryIcon, StarIcon, UserIcon } from "../components/icons";
import FloatingDock from "../components/FloatingDock";



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
    // 1. Baixa a imagem em segundo plano
    const res = await fetch(url);
    const blob = await res.blob();

    // 2. Cria o link de download forçado para o PC
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    
    // 3. Define o nome do arquivo que será salvo
    a.download = `${filename}.jpg`;
    
    // 4. Executa o download silencioso
    document.body.appendChild(a);
    a.click();
    
    // 5. Limpa a memória do navegador
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // Plano B: Abre a imagem em uma nova aba se o download falhar
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
  // --- Lógica do Modo Cinema (Carrossel) ---
  function showNextImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filtered.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex < filtered.length - 1) {
      setSelectedImage(filtered[currentIndex + 1]);
    }
  }

  function showPrevImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filtered.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(filtered[currentIndex - 1]);
    }
  }

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
          <div className="text-center py-24 px-6 flex flex-col items-center">
            {/* Ícone de luxo para não deixar a tela vazia demais */}
            <div className={clsx("mb-6 opacity-20", isDark ? "text-white" : "text-zinc-900")}>
              <GalleryIcon className="h-12 w-12" />
            </div>

            {/* Título Principal */}
            <div className={clsx(
              "text-[11px] font-black uppercase tracking-[0.4em]",
              isDark ? "text-white" : "text-zinc-900"
            )}>
              No designs found yet.
            </div>

            {/* Frase de Instrução */}
            <div className={clsx(
              "mt-4 text-sm font-medium tracking-tight max-w-[280px] mx-auto leading-relaxed",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}>
              Create your first image and view it here in your gallery.
            </div>
          </div>
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

                      <button onClick={() => navigator.share?.({ title: 'HomeRenovAi', url: it.imageUrl })} className={clsx("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all active:scale-95 group/btn", isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10" : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100")}>
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

      <FloatingDock activePage="gallery" />

      {/* --- MODAL DE VISUALIZAÇÃO (MODO CINEMA) --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botão Fechar */}
          <button
            className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <XIcon className="h-6 w-6" />
          </button>

          {/* Botão Anterior (Seta Esquerda) */}
          <button
            onClick={showPrevImage}
            disabled={filtered.findIndex(img => img.id === selectedImage.id) === 0}
            className="absolute left-2 md:left-8 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#D4AF37] hover:text-black transition-all z-[110] disabled:opacity-20 disabled:hover:bg-black/50 disabled:hover:text-white"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          {/* Imagem Central */}
          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt="Enlarged design"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />

            {/* Ajuste Cirúrgico: bottom-6 puxa o botão pra cima no celular, md:bottom-[-40px] mantém intacto no desktop */}
            <div className="absolute bottom-6 md:bottom-[-17px] left-1/2 -translate-x-1/2 flex gap-4 z-50">
              <button
                onClick={() => forceDownload(selectedImage.imageUrl)}
                className="px-6 py-2 bg-[#D4AF37] text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                Download Image
              </button>
            </div>
          </div>

          {/* Botão Próximo (Seta Direita) */}
          <button
            onClick={showNextImage}
            disabled={filtered.findIndex(img => img.id === selectedImage.id) === filtered.length - 1}
            className="absolute right-2 md:right-8 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#D4AF37] hover:text-black transition-all z-[110] disabled:opacity-20 disabled:hover:bg-black/50 disabled:hover:text-white"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}