"use client";

import { createClient } from "./lib/supabase/client";
import CreditsBadge from "./components/CreditsBadge";
import type React from "react";
import { useRef, useState, useEffect, useMemo } from "react";
import { useTheme } from "./components/ThemeProvider";
import Link from "next/link";
import clsx from "clsx";

const ROOM_TYPES = [
  { value: "living_room", label: "Living room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "balcony", label: "Balcony" },
  { value: "home_theater", label: "Home theater" },
  { value: "store", label: "Store" },
  { value: "house_facade", label: "House facade" },
  { value: "other", label: "Other" },
] as const;

const goldAccent = "#D4AF37";

/* ---------- Ícones ---------- */
function SparklesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14.5 9L21 10L16 14.5L17.5 21L12 18L6.5 21L8 14.5L3 10L9.5 9L12 3Z" fill="#3B82F6" />
      <path d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z" fill="#60A5FA" />
    </svg>
  );
}
function LightbulbIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8 14c-1.2-1.2-2-2.9-2-4.8A6 6 0 0 1 12 3a6 6 0 0 1 6 6.2c0 1.9-.8 3.6-2 4.8-.9.9-1.6 2-1.8 3H9.8c-.2-1-1-2.1-1.8-3Z" /></svg>;
}
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
function CameraIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 7h3l2-2h6l2 2h3v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" /><circle cx="12" cy="13" r="3" /></svg>;
}
function UploadIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v10" /><path d="M8 7l4-4 4 4" /><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></svg>;
}

/* ---------- Lógica Auxiliar ---------- */
async function prepareImageForUpload(file: File): Promise<File> {
  const img = document.createElement("img");
  img.decoding = "async";
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image Load Error"));
      img.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
    canvas.width = img.width * scale; canvas.height = img.height * scale;
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.85));
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } finally { URL.revokeObjectURL(objectUrl); }
}

function BeforeAfterSlider({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string; }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl select-none touch-none bg-black"
      onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); setDragging(true); }}
      onPointerMove={(e) => { if (dragging) { const r = e.currentTarget.getBoundingClientRect(); setPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); } }}
      onPointerUp={() => setDragging(false)}>
      <img src={afterSrc} alt="After" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={beforeSrc} alt="Before" className="h-full w-full object-cover" draggable={false} />
      </div>
      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[8px] font-black uppercase text-white border border-white/10 backdrop-blur-sm">Before</div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-[#D4AF37] px-3 py-1 text-[8px] font-black uppercase text-black shadow-lg">After</div>
      <div className="absolute top-0 h-full" style={{ left: `calc(${pos}% - 1px)` }}>
        <div className="h-full w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-2xl flex items-center justify-center text-black font-bold cursor-ew-resize">‹›</div>
      </div>
    </div>
  );
}

const STYLES = [
  { id: "Modern", title: "MODERN" },
  { id: "Minimalist", title: "MINIMALIST" },
  { id: "Scandinavian", title: "SCANDINAVIAN" },
  { id: "Japanese", title: "JAPANESE" },
  { id: "Rustic", title: "RUSTIC" },
  { id: "Industrial", title: "INDUSTRIAL" },
  { id: "Boho", title: "BOHO" },
  { id: "Super Luxury", title: "SUPER LUXURY" },
] as const;

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<typeof STYLES[number]["id"]>("Modern");
  const [roomType, setRoomType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [creditsTick, setCreditsTick] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("homeai_last_result");
    if (saved) setResultUrl(saved);
  }, []);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) { setResultUrl(null); setFile(f); }
    e.target.value = "";
  };

  async function downloadResult() {
    if (!resultUrl) return;
    try {
      // 1. Pega a imagem real do banco
      const res = await fetch(resultUrl);
      const blob = await res.blob();

      // 2. Tenta invocar a "Gaveta Nativa" do celular (com a imagem dentro)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "homerenovai-design.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "HomeRenovAi Design",
          });
          return; // Se a gaveta abrir, nosso trabalho aqui terminou
        }
      }

      // 3. Se for PC (ou o celular não suportar a gaveta), faz o download normal
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homerenovai-design.jpg`;
      document.body.appendChild(a); // Essencial para navegadores chatos
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Último recurso de segurança caso a internet pisque
      window.open(resultUrl, "_blank");
    }
  }

  async function onGenerate() {
    if (isGenerating || !file) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const optimized = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("style", selectedStyle);
      formData.append("roomType", roomType || "other");
      formData.append("image", optimized);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      if (!res.ok) throw new Error("IA Failed");

      const finalBlob = await res.blob();
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Session expired");

      const imageId = crypto.randomUUID();
      const path = `${userData.user.id}/${imageId}.jpg`;
      await supabase.storage.from("homeai").upload(path, finalBlob);
      const imageUrl = supabase.storage.from("homeai").getPublicUrl(path).data.publicUrl;

      const generatedPrompt = `${selectedStyle} style ${roomType || "room"}`;

      const { error: dbError } = await supabase.from("gallery_items").insert({
        id: imageId,
        user_id: userData.user.id,
        room_type: roomType || "other",
        style: selectedStyle,
        image_url: imageUrl,
        thumb_url: imageUrl,
        prompt: generatedPrompt,
        is_favorite: false
      });

      if (dbError) throw dbError;

      setResultUrl(imageUrl);
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      setErrorMsg("Error generating image.");
    } finally {
      setIsGenerating(false);
      setCreditsTick(t => t + 1);
    }
  }

  return (
    <main className={clsx("min-h-screen p-4 md:p-10 transition-colors duration-500", isDark ? "bg-[#0A0A0A]" : "bg-[#F4F4F5]")}>
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tighter flex items-center">
              <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
              <span className="text-blue-500">RenovAi</span>
              <SparklesIcon className="h-8 w-8 ml-1" />
            </h1>
          </div>
          <p className={clsx("text-lg font-bold leading-tight", isDark ? "text-white" : "text-zinc-800")}>Redesign your space with Ai</p>
          <p className="text-sm md:text-zinc-500">Upload a room photo and generate design variations in different styles</p>
        </header>

        {/* PAINÉIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 items-stretch">

          {/* PAINEL ESQUERDO (Workspace Estável) */}
          <section className={clsx("rounded-t-[2.5rem] rounded-b-none md:rounded-[2.5rem] border-b-0 md:border-b p-6 border shadow-2xl flex flex-col transition-colors", isDark ? "bg-black border-white/5 text-white" : "bg-white border-zinc-200 text-zinc-900")}>
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-[10px] font-bold uppercase tracking-widest md:text-zinc-400">Workspace</span>
              <div className="flex items-center gap-4">
                <CreditsBadge refreshKey={creditsTick} />
                <button onClick={toggleTheme} className="text-xl hover:scale-110 transition-transform">
                  {isDark ? "☀️" : "🌙"}
                </button>
              </div>
            </div>

            {/* ÁREA DE UPLOAD COM PROPORÇÃO FIXA (aspect-[5/4]) */}
            <div className={clsx("relative w-full aspect-[5/4] rounded-[2rem] overflow-hidden mb-6 flex flex-col items-center justify-center transition-all duration-300", !previewUrl && "border-2 border-dashed", isDark ? (!previewUrl ? "bg-[#161616] border-white/10 hover:border-[#D4AF37]/50" : "bg-[#111] border border-white/10") : (!previewUrl ? "bg-zinc-50 border-zinc-300 hover:border-[#D4AF37]/50" : "bg-zinc-100 border border-zinc-200"))}>
              {!previewUrl ? (
                <div className="flex flex-col items-center justify-center md:text-zinc-500 px-6">
                  <div className={clsx("h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors", isDark ? "bg-white/5" : "bg-black/5")}>
                    <SparklesIcon className="h-7 w-7 text-[#D4AF37] opacity-80" />
                  </div>
                  <p className="text-[10px] text-center uppercase font-black tracking-widest leading-relaxed">
                    Select a high-quality photo<br />of your room
                  </p>
                </div>
              ) : resultUrl ? (
                <BeforeAfterSlider beforeSrc={previewUrl} afterSrc={resultUrl} />
              ) : (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              )}
            </div>

            <button onClick={() => setTipsOpen(true)} className="flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-5 hover:scale-105 transition-all outline-none">
              <LightbulbIcon className="h-5 w-5" /> PHOTO TIPS
            </button>

            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase mb-3 px-2 md:text-zinc-400">1 - Choose Image</p>
              <div className={clsx("grid grid-cols-2 gap-4 p-2 rounded-3xl border transition-colors", isDark ? "border-white/10 bg-[#080808]" : "border-zinc-200 bg-zinc-50")}>
                <button onClick={() => cameraInputRef.current?.click()} className={clsx("flex items-center justify-center gap-3 py-4 rounded-xl transition-all border border-transparent active:scale-95 group", isDark ? "hover:bg-white/5" : "hover:bg-white shadow-sm")}>
                  <CameraIcon className="h-5 w-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Use Camera</span>
                </button>
                <button onClick={() => uploadInputRef.current?.click()} className={clsx("flex items-center justify-center gap-3 py-4 rounded-xl transition-all border border-transparent active:scale-95 group", isDark ? "hover:bg-white/5" : "hover:bg-white shadow-sm")}>
                  <UploadIcon className="h-5 w-5 text-[#D4AF37] group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">From Gallery</span>
                </button>
              </div>
            </div>

            <nav className="hidden md:flex justify-around mt-4 pt-3 border-t border-zinc-500/10 pb-1">
              <Link href="/" className="flex flex-col items-center gap-1.5 text-[#D4AF37] group">
                <HomeIcon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                <div className="h-1 w-4 bg-[#D4AF37] rounded-full mt-0.5" />
              </Link>
              <Link href="/gallery" className="flex flex-col items-center gap-1.5 md:text-zinc-500 hover:text-[#D4AF37] transition-all group">
                <GalleryIcon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Gallery</span>
              </Link>
              <Link href="/upgrade" className="flex flex-col items-center gap-1.5 md:text-zinc-500 hover:text-[#D4AF37] transition-all group">
                <StarIcon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Upgrade</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-1.5 md:text-zinc-500 hover:text-[#D4AF37] transition-all group">
                <UserIcon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
              </Link>
            </nav>
          </section>

          {/* PAINEL DIREITO (Layout Flexível Sem Buracos) */}
          <section className={clsx("rounded-b-[2.5rem] rounded-t-none md:rounded-[2.5rem] border-t-0 md:border-t p-8 border shadow-2xl flex flex-col h-full justify-between transition-colors", isDark ? "bg-black border-white/5 text-white" : "bg-white border-zinc-200 text-zinc-900")}>

            {/* Grupo Superior: Título, Grid e Seletor */}
            <div>
              <div className="text-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] md:text-zinc-500">2 - Select Style</p>
              </div>

              {/* Grid de Estilos Altos (Portrait) com Texto Externo */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {STYLES.map((s) => {
                  const isSel = s.id === selectedStyle;
                  return (
                    <button key={s.id} onClick={() => setSelectedStyle(s.id)} className="group outline-none flex flex-col gap-3">
                      <div className={clsx(
                        "relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300",
                        isSel ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105" : "border-transparent hover:border-white/20 hover:scale-105"
                      )}>
                        <img src={`/styles/${s.id.toLowerCase().replace(" ", "-")}.jpg`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={s.title} />
                      </div>
                      <span className={clsx("w-full truncate text-[7.5px] md:text-[9px] font-black text-center tracking-wider md:tracking-widest uppercase transition-colors", isSel ? "text-[#D4AF37]" : "md:text-zinc-500 group-hover:text-zinc-300")}>
                        {s.title}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]md:text-zinc-500 mb-4">3 - Room Type</p>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={clsx("w-full border rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest text-center appearance-none focus:border-[#D4AF37] outline-none transition-colors", isDark ? "bg-[#111] border-white/10" : "bg-zinc-50 border-zinc-200")}>
                  <option value="">Select Room Environment</option>
                  {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {/* Botões de Ação (Fixos no Rodapé) */}
            <div className="mt-auto space-y-4 pt-8">
              <button
                onClick={onGenerate}
                disabled={!file || isGenerating}
                className={clsx(
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-300",
                  (!file || isGenerating)
                    ? (isDark ? "bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed" : "bg-zinc-100 border border-zinc-200 md:text-zinc-400 cursor-not-allowed")
                    : "bg-gradient-to-r from-[#D4AF37] to-[#B6922E] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] active:scale-95 hover:brightness-110"
                )}
              >
                {isGenerating ? "Redesigning..." : "Generate Design"}
              </button>

              <button
                onClick={downloadResult}
                disabled={!resultUrl}
                className={clsx(
                  "w-full py-5 rounded-2xl border font-black text-xs uppercase tracking-[0.3em] transition-all duration-300",
                  !resultUrl
                    ? (isDark ? "border-white/5 text-zinc-600 bg-transparent cursor-not-allowed" : "border-zinc-200 md:text-zinc-400 bg-transparent cursor-not-allowed")
                    : "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black active:scale-95"
                )}
              >
                Download
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* --- PHOTO TIPS MODAL (Dinâmico Light/Dark) --- */}
      {tipsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Fundo escurecido/clareado translúcido */}
          <div
            className={clsx("absolute inset-0 backdrop-blur-md", isDark ? "bg-black/80" : "bg-white/80")}
            onClick={() => setTipsOpen(false)}
          />

          {/* Caixa Principal */}
          <div className={clsx("relative w-full max-w-sm p-8 rounded-[2.5rem] border shadow-2xl animate-in fade-in zoom-in-95 duration-300", isDark ? "bg-black text-white border-white/10" : "bg-white text-zinc-900 border-zinc-200")}>

            <div className="flex items-center gap-3 mb-8 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10">
                <LightbulbIcon className="h-7 w-7 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Photo Tips</h3>
            </div>

            <div className="space-y-8 mb-10 text-left">
              <div className="flex gap-5">
                <span className="text-2xl">☀️</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Lighting</p>
                  <p className={clsx("text-xs leading-relaxed font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>Use natural daylight. Avoid dark rooms for better AI textures.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Perspective</p>
                  <p className={clsx("text-xs leading-relaxed font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>Shoot from a corner. It helps the AI understand depth.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl">🧹</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Clutter</p>
                  <p className={clsx("text-xs leading-relaxed font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>Remove small objects. A clean space gives better results.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Focus</p>
                  <p className={clsx("text-xs leading-relaxed font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>Keep your phone steady. Avoid blurry photos.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setTipsOpen(false)} className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform bg-[#D4AF37] text-black hover:brightness-110">
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      <input ref={cameraInputRef} type="file" capture="environment" className="hidden" onChange={onPickFile} />
      <input ref={uploadInputRef} type="file" className="hidden" onChange={onPickFile} />
    </main>
  );
}