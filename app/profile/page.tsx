"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useTheme } from "../components/ThemeProvider";
import clsx from "clsx";
import { useRouter } from "next/navigation";

// --- Ícones (Mantidos) ---
const SunIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>;
const MoonIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const UserIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const ShieldIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const CrownIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
const LogOutIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></svg>;
const ChevronRight = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="m9 18 6-6-6-6" /></svg>;
const GiftIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>;
const CameraIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;

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
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function getData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);

        // 1. Busca os créditos via API (conforme sua Home)
        try {
          const res = await fetch("/api/credits", { cache: "no-store" });
          const j = await res.json();
          if (j.ok) {
            setCredits(j.totalRemaining ?? 0);
            if (j.plan) setPlan(j.plan.charAt(0).toUpperCase() + j.plan.slice(1) + " Member");
          }
        } catch (e) { console.error(e); setCredits(0); }

        // 2. Busca a foto de perfil na tabela 'profiles'
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", authUser.id)
          .single();
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    }
    getData();
  }, [supabase]);

  // FUNÇÃO DE UPLOAD DE FOTO
  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload para o bucket 'homeai' (reutilizando sua estrutura)
      const { error: uploadError } = await supabase.storage
        .from("homeai")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Gera a URL pública
      const { data: { publicUrl } } = supabase.storage.from("homeai").getPublicUrl(filePath);

      // Atualiza o banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

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
    <div className={clsx("min-h-screen transition-colors duration-500 pb-32 pt-10 px-6", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-md">

        <header className="flex flex-col items-center mb-10">
          <div className="flex w-full items-center justify-between mb-8">
            <div className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-white border-zinc-200")}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: goldAccent }} />
              Account • Executive
            </div>
            <button onClick={toggleTheme} className={clsx("h-11 w-11 flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-sm", isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white hover:bg-zinc-100")}>
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* AVATAR CLICÁVEL COM PREVIEW E UPLOAD */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#F1D279] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className={clsx("relative h-24 w-24 rounded-full border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center shadow-2xl transition-transform active:scale-90", isDark ? "bg-zinc-900" : "bg-white")}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black">{user?.email?.[0].toUpperCase()}</span>
              )}

              {/* Overlay de Câmera no Hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CameraIcon className="h-6 w-6 text-white" />}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          </div>

          <h1 className="mt-6 text-2xl font-black tracking-tight">{user?.email?.split('@')[0]}</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1">{plan}</p>
        </header>

        {/* Créditos Disponíveis (Lógica API) */}
        <section className={clsx("rounded-[2.5rem] p-6 border mb-6 transition-all", isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-100 shadow-md")}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Available Credits</p>
              <h3 className="text-2xl font-black" style={{ color: goldAccent }}>{credits} Credits</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <GiftIcon className="h-6 w-6 text-[#D4AF37]" />
            </div>
          </div>

          <button
            onClick={() => {
              const link = `https://homeai.web/join?ref=${user?.id}`;
              navigator.clipboard.writeText(link);
              alert("Referral link copied! Share it to earn +1 credit per friend.");
            }}
            className={clsx("w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}
          >
            Invite Friend • Earn +1 Credit
          </button>
        </section>

        {/* Upgrade Showcase */}
        <section className={clsx("rounded-[2.5rem] p-8 border-t mb-8 relative overflow-hidden transition-all", isDark ? "bg-zinc-900/40 border-white/10 shadow-2xl" : "bg-white border-zinc-100 shadow-xl")}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Best Plan</p>
              <h2 className="text-xl font-black flex items-center gap-2 text-[#D4AF37]">
                Pro+ Elite
                <CrownIcon className="h-5 w-5" />
              </h2>
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter mt-1">Unlock Unlimited Generations</p>
            </div>
            <button
              onClick={() => router.push('/upgrade')}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Upgrade
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </section>

        {/* Menu Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={clsx("w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98]",
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}
            >
              <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 opacity-60" />
                <span className="text-xs font-black uppercase tracking-widest">Personal Information</span>
              </div>
              <ChevronRight className={clsx("h-4 w-4 transition-transform", showDetails && "rotate-90")} />
            </button>

            {showDetails && (
              <div className={clsx("mx-2 p-5 rounded-2xl border-x border-b animate-in slide-in-from-top-2 duration-300", isDark ? "border-white/5 bg-white/[0.02]" : "border-zinc-100 bg-zinc-50")}>
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Email Address</p>
                    <p className="text-[10px] opacity-80">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Account Status</p>
                    <p className="text-[10px] font-bold text-[#D4AF37]">{plan}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => router.push('/privacy')} className={clsx("w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98]", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
            <div className="flex items-center gap-4">
              <ShieldIcon className="h-5 w-5 opacity-60" />
              <span className="text-xs font-black uppercase tracking-widest">Privacy Policy</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-40" />
          </button>

          <button onClick={() => router.push('/terms')} className={clsx("w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98]", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
            <div className="flex items-center gap-4">
              <ShieldIcon className="h-5 w-5 opacity-60" />
              <span className="text-xs font-black uppercase tracking-widest">Terms of Service</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-40" />
          </button>

          <button onClick={handleSignOut} className={clsx("w-full flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all active:scale-95 mt-10", isDark ? "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10" : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}>
            <LogOutIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
          </button>
        </div>

        <footer className="mt-16 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">Home AI v2.0.26 • Built for Excellence</p>
        </footer>
      </div>
    </div>
  );
}