"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useTheme } from "../components/ThemeProvider";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Ícones Gerais ---
const SunIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>;
const MoonIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const UserIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const ShieldIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const CrownIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
const LogOutIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></svg>;
const ChevronRight = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
const GiftIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>;
const CameraIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;

// Ícones para os Stats e Personal Info
const MailIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
const CheckCircleIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>;
const PhotoIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
const PaletteIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>;

function SparklesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14.5 9L21 10L16 14.5L17.5 21L12 18L6.5 21L8 14.5L3 10L9.5 9L12 3Z" fill="#3B82F6" />
      <path d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z" fill="#60A5FA" />
    </svg>
  );
}

// --- Menu Icons ---
function HomeIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function GalleryIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
}
function StarIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function UserIconMenu({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}

const goldAccent = "#D4AF37";

export default function ProfilePage() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | string>("...");
  const [plan, setPlan] = useState<string>("Free Member");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Novos estados para os Quick Stats
  const [totalDesigns, setTotalDesigns] = useState<number | string>("...");
  const [favoriteStyle, setFavoriteStyle] = useState<string>("...");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function getData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        try {
          const res = await fetch("/api/credits", { cache: "no-store" });
          const j = await res.json();
          if (j.ok) {
            setCredits(j.totalRemaining ?? 0);
            if (j.plan) setPlan(j.plan.charAt(0).toUpperCase() + j.plan.slice(1) + " Member");
          }
        } catch (e) { console.error(e); setCredits(0); }

        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", authUser.id)
          .single();
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

        // --- BUSCA DAS ESTATÍSTICAS RÁPIDAS ---
        try {
          // 1. Total de Designs (Conta as linhas na tabela "gallery_items")
          const { count, error: countError } = await supabase
            .from("gallery_items")
            .select("*", { count: "exact", head: true })
            .eq("user_id", authUser.id);

          if (!countError && count !== null) {
            setTotalDesigns(count);
          } else {
            setTotalDesigns(0);
          }

          // 2. Estilo Favorito (Busca os estilos para calcular o mais frequente)
          const { data: styleData, error: styleError } = await supabase
            .from("gallery_items")
            .select("style")
            .eq("user_id", authUser.id);

          if (!styleError && styleData && styleData.length > 0) {
            const counts: Record<string, number> = {};
            let maxCount = 0;
            let fav = "-";

            styleData.forEach(row => {
              const s = row.style;
              if (s) {
                counts[s] = (counts[s] || 0) + 1;
                if (counts[s] > maxCount) {
                  maxCount = counts[s];
                  fav = s;
                }
              }
            });

            if (fav !== "-") {
              // Deixa a primeira letra maiúscula para ficar bonito no layout
              setFavoriteStyle(fav.charAt(0).toUpperCase() + fav.slice(1));
            } else {
              setFavoriteStyle("-");
            }
          } else {
            setFavoriteStyle("-");
          }
        } catch (error) {
          console.error("Erro ao buscar estatísticas:", error);
          setTotalDesigns(0);
          setFavoriteStyle("-");
        }
      }
      setLoading(false);
    }
    getData();
  }, [supabase]);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("homeai").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("homeai").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      alert("Profile picture updated!");
    } catch (error: any) {
      alert("Error uploading: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className={clsx("min-h-screen flex items-center justify-center", isDark ? "bg-[#0A0A0A]" : "bg-zinc-50")}>
        <div className="h-8 w-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen transition-colors duration-500 pb-32 pt-6 px-6 md:px-10", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-6xl">

        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-2 mb-1 self-start md:self-auto">
            <h1 className="text-3xl font-black tracking-tighter hidden md:flex items-center">
              <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
              <span className="text-blue-500">RenovAi</span>
              <SparklesIcon className="h-8 w-8 ml-1" />
            </h1>
          </div>

          <div className="flex w-full md:w-auto items-center justify-between gap-4">
            <div className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-white border-zinc-200")}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: goldAccent }} />
              Account • Executive
            </div>

            <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition-transform px-2">
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* --- GRID LAYOUT (COCKPIT) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* COLUNA ESQUERDA: PERFIL E CRÉDITOS */}
          <div className="space-y-6">

            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-6">
              <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#F1D279] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className={clsx("relative h-28 w-28 rounded-full border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center shadow-2xl transition-transform active:scale-90", isDark ? "bg-zinc-900" : "bg-white")}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black">{user?.email?.[0].toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CameraIcon className="h-8 w-8 text-white" />}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </div>

              <h1 className="text-3xl font-black tracking-tight">{user?.email?.split('@')[0]}</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1">{plan}</p>
            </div>

            <section className={clsx("rounded-[2.5rem] p-8 border transition-all", isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-100 shadow-md")}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Available Credits</p>
                  <h3 className="text-4xl font-black" style={{ color: goldAccent }}>{credits}</h3>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <GiftIcon className="h-7 w-7 text-[#D4AF37]" />
                </div>
              </div>

              <button
                onClick={() => {
                  const link = `https://homeai.web/join?ref=${user?.id}`;
                  navigator.clipboard.writeText(link);
                  alert("Referral link copied! Share it to earn +1 credit per friend.");
                }}
                className={clsx("w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 hover:brightness-110",
                  isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}
              >
                Invite Friend • Earn +1 Credit
              </button>
            </section>

            <section className={clsx("hidden md:block rounded-[2.5rem] p-8 border relative overflow-hidden transition-all", isDark ? "bg-zinc-900/40 border-white/10 shadow-2xl" : "bg-white border-zinc-100 shadow-xl")}>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Best Plan</p>
                  <h2 className="text-xl font-black flex items-center gap-2 text-[#D4AF37]">
                    Pro+ Elite <CrownIcon className="h-5 w-5" />
                  </h2>
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter mt-1">Unlock Unlimited Generations</p>
                </div>
                <button onClick={() => router.push('/upgrade')} className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Upgrade
                </button>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA: CONFIGURAÇÕES, STATS E LISTA */}
          <div className="space-y-6">

            {/* MOBILE ONLY - Promo Card */}
            <section className={clsx("md:hidden rounded-[2.5rem] p-8 border relative overflow-hidden transition-all", isDark ? "bg-zinc-900/40 border-white/10 shadow-2xl" : "bg-white border-zinc-100 shadow-xl")}>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Best Plan</p>
                  <h2 className="text-xl font-black flex items-center gap-2 text-[#D4AF37]">
                    Pro+ Elite <CrownIcon className="h-5 w-5" />
                  </h2>
                </div>
                <button onClick={() => router.push('/upgrade')} className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Upgrade
                </button>
              </div>
            </section>

            <div className="space-y-4">
              {/* Accordion: Personal Information */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={clsx("w-full flex items-center justify-between p-6 rounded-2xl border transition-all active:scale-[0.98]",
                    isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}
                >
                  <div className="flex items-center gap-4">
                    <UserIcon className="h-5 w-5 opacity-60" />
                    <span className="text-xs font-black uppercase tracking-widest">Personal Information</span>
                  </div>
                  <ChevronRight className={clsx("h-4 w-4 transition-transform", showDetails && "rotate-90")} />
                </button>

                {showDetails && (
                  <div className={clsx("mx-2 p-6 rounded-2xl border-x border-b animate-in slide-in-from-top-2 duration-300", isDark ? "border-white/5 bg-white/[0.02]" : "border-zinc-100 bg-zinc-50")}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={clsx("p-2.5 rounded-xl", isDark ? "bg-white/5" : "bg-zinc-200/50")}>
                          <MailIcon className="h-5 w-5 opacity-70" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Email Address</p>
                          <p className={clsx("text-sm font-medium", isDark ? "text-gray-200" : "text-zinc-800")}>{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={clsx("p-2.5 rounded-xl", isDark ? "bg-white/5" : "bg-zinc-200/50")}>
                          <CheckCircleIcon className="h-5 w-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Account Status</p>
                          <p className="text-sm font-bold text-[#D4AF37]">{plan}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion: Privacy Policy */}
              <button onClick={() => router.push('/privacy')} className={clsx("w-full flex items-center justify-between p-6 rounded-2xl border transition-all active:scale-[0.98]", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                <div className="flex items-center gap-4">
                  <ShieldIcon className="h-5 w-5 opacity-60" />
                  <span className="text-xs font-black uppercase tracking-widest">Privacy Policy</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </button>

              {/* Accordion: Terms of Service */}
              <button onClick={() => router.push('/terms')} className={clsx("w-full flex items-center justify-between p-6 rounded-2xl border transition-all active:scale-[0.98]", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                <div className="flex items-center gap-4">
                  <ShieldIcon className="h-5 w-5 opacity-60" />
                  <span className="text-xs font-black uppercase tracking-widest">Terms of Service</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </button>

              {/* --- QUICK STATS CARD (AGORA COM DADOS REAIS) --- */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className={clsx("p-6 rounded-2xl border flex flex-col justify-center items-center text-center transition-all hover:-translate-y-1 cursor-default", isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-100 shadow-sm")}>
                  <PhotoIcon className="h-6 w-6 text-[#D4AF37] mb-3 opacity-80" />
                  <h3 className="text-3xl font-black" style={{ color: goldAccent }}>{totalDesigns}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">Total Designs</p>
                </div>
                <div className={clsx("p-6 rounded-2xl border flex flex-col justify-center items-center text-center transition-all hover:-translate-y-1 cursor-default", isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-100 shadow-sm")}>
                  <PaletteIcon className="h-6 w-6 text-[#D4AF37] mb-3 opacity-80" />
                  <h3 className="text-xl font-black mt-2" style={{ color: goldAccent }}>{favoriteStyle}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-2">Favorite Style</p>
                </div>
              </div>

              {/* Botão de Sign Out isolado e com destaque inferior */}
              <button onClick={handleSignOut} className={clsx("w-full flex items-center justify-center gap-3 p-6 rounded-2xl border transition-all active:scale-95 mt-4", isDark ? "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10" : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}>
                <LogOutIcon className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center opacity-30">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">HomeRenovAi v2.1.0 • Built for Excellence</p>
        </footer>
      </div>

      {/* --- MENU FLUTUANTE (DOCK) --- */}
      <div className="fixed bottom-6 md:bottom-10 left-0 right-0 z-[100] flex justify-center pointer-events-none">
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

          <Link href="/gallery" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <GalleryIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Gallery
            </span>
          </Link>

          <Link href="/upgrade" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <StarIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Upgrade
            </span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all hover:-translate-y-1">
            <UserIconMenu className="h-6 w-6 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
              Profile
            </span>
            <div className="h-1 w-1 bg-[#D4AF37] rounded-full absolute -bottom-1" />
          </Link>
        </nav>
      </div>

    </div>
  );
}