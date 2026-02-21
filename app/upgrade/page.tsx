"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeProvider";
import clsx from "clsx";
import type React from "react";

// --- Tipos ---
type Plan = "pro" | "pro_plus";
type Busy = null | "checkout_pro" | "checkout_pro_plus" | "portal";

// --- Ícones Gerais ---
function SparklesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14.5 9L21 10L16 14.5L17.5 21L12 18L6.5 21L8 14.5L3 10L9.5 9L12 3Z" fill="#3B82F6" />
      <path d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z" fill="#60A5FA" />
    </svg>
  );
}
function CheckIcon({ className = "", style }: { className?: string, style?: React.CSSProperties }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M20 6 9 17l-5-5" /></svg>;
}

// --- Menu Icons (Unificados) ---
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

// --- Função Auxiliar do Stripe (Lógica Intacta) ---
async function postForRedirectUrl(endpoint: string, body?: any) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403) throw new Error(data?.error || "Please sign in to continue.");
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  if (!data?.url) throw new Error("Stripe URL not returned.");
  return data.url;
}

export default function UpgradePage() {
  const { isDark, toggleTheme } = useTheme();

  // 🌟 MOCK STATE ADICIONADO AQUI 🌟
  // Altere manualmente a palavra "pro" abaixo para "free" ou "pro_plus" e salve para testar o visual!
  // 🌟 ESTADO DO PLANO (Começa como 'free' até o banco responder) 🌟
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "pro_plus">("free");

  // 🌟 BUSCA O PLANO REAL NO SUPABASE (Reaproveitando a inteligência do Perfil) 🌟
  useEffect(() => {
    async function getUserPlan() {
      try {
        const res = await fetch("/api/credits", { cache: "no-store" });
        const data = await res.json();

        if (data.ok && data.plan) {
          // data.plan já vem do seu banco como "free", "pro" ou "pro_plus"
          setCurrentPlan(data.plan);
        }
      } catch (error) {
        console.error("Erro ao buscar o plano:", error);
      }
    }
    getUserPlan();
  }, []);

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const isBusy = busy !== null;

  // Estilos dinâmicos
  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const subtleText = isDark ? "text-zinc-500" : "text-zinc-500";
  const goldAccent = "#D4AF37";

  // Lógica de Checkout (Mantida)
  async function handleCheckout(plan: Plan) {
    try {
      setError(null);
      setBusy(plan === "pro" ? "checkout_pro" : "checkout_pro_plus");
      const url = await postForRedirectUrl("/api/stripe/checkout", { plan });
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "Could not start checkout.");
      setBusy(null);
    }
  }

  async function handlePortal() {
    try {
      setError(null);
      setBusy("portal");
      const url = await postForRedirectUrl("/api/stripe/portal");
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "Could not open billing portal.");
      setBusy(null);
    }
  }

  return (
    <main className={clsx("min-h-screen transition-colors duration-300 pb-40 pt-6 px-4 md:px-10", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-6xl">

        {/* --- CABEÇALHO --- */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tighter flex items-center">
              <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
              <span className="text-blue-500">RenovAi</span>
              <SparklesIcon className="h-8 w-8 ml-1" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <p className={clsx("hidden md:block text-xs font-medium uppercase tracking-widest", subtleText)}>
              Invest in your creativity
            </p>
            <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition-transform px-2">
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Choose your plan</h2>
          <p className={clsx("text-sm md:text-base", mutedText)}>
            Unlock premium styles and faster generations. Credits reset monthly.
          </p>
        </div>

        {error && (
          <div className={clsx("mb-8 max-w-md mx-auto rounded-xl p-4 text-sm text-center border", isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700")}>
            {error}
          </div>
        )}

        {/* --- GRID DE PLANOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start max-w-5xl mx-auto">

          {/* Plan FREE */}
          <div className={clsx("rounded-[2rem] p-8 border transition-all hover:-translate-y-1 duration-300", isDark ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200")}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className={clsx("text-xs mt-1", mutedText)}>Perfect to try it out</p>
              </div>
              <span className="text-2xl font-black opacity-50">$0</span>
            </div>
            <div className="h-px w-full bg-current opacity-10 mb-6" />
            <ul className={clsx("space-y-4 text-sm mb-8", subtleText)}>
              <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 opacity-70" /> 3 total credits</li>
              <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 opacity-70" /> Standard quality</li>
              <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 opacity-70" /> Personal use only</li>
            </ul>

            {/* Lógica Condicional do Botão Free */}
            {currentPlan === "free" ? (
              <button disabled className={clsx("w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider opacity-50 cursor-default border", isDark ? "border-white/10" : "border-zinc-200")}>
                Current Plan
              </button>
            ) : (
              <div className={clsx("w-full py-4 text-center font-bold text-xs uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-zinc-900")}>
                Included in your plan
              </div>
            )}
          </div>

          {/* Plan PRO */}
          <div className={clsx("rounded-[2rem] p-8 border-2 transition-all hover:-translate-y-1 duration-300 relative", isDark ? "bg-zinc-900/60 border-zinc-700" : "bg-white border-zinc-300")}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black" style={{ color: isDark ? goldAccent : 'inherit' }}>Pro</h3>
                <p className={clsx("text-xs mt-1", mutedText)}>Best for daily use</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black">$9.99</span>
                <p className={clsx("text-[9px] uppercase font-bold", subtleText)}>/ month</p>
              </div>
            </div>
            <div className="h-px w-full bg-current opacity-10 mb-6" />
            <ul className="space-y-4 text-sm mb-8">
              <li className="flex items-center gap-3 font-medium"><CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> 100 credits / mo</li>
              <li className="flex items-center gap-3 font-medium"><CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> Priority generation</li>
              <li className="flex items-center gap-3 font-medium"><CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> Premium Styles</li>
            </ul>

            {/* Lógica Condicional do Botão Pro */}
            {currentPlan === "pro" ? (
              <button disabled className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider cursor-default border-2 opacity-60" style={{ borderColor: goldAccent, color: goldAccent }}>
                Current Plan
              </button>
            ) : currentPlan === "pro_plus" ? (
              <div className={clsx("w-full py-4 text-center font-bold text-xs uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-zinc-900")}>
                Included in your plan
              </div>
            ) : (
              <button onClick={() => handleCheckout("pro")} disabled={isBusy} className={clsx("w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95", isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black")}>
                {busy === "checkout_pro" ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            )}
          </div>

          {/* Plan PRO+ (BEST VALUE) */}
          <div className={clsx("rounded-[2rem] p-8 border-2 relative overflow-hidden transition-all hover:-translate-y-1 duration-300 shadow-2xl", isDark ? "bg-black" : "bg-zinc-50")} style={{ borderColor: goldAccent }}>
            {/* Faixa Best Value */}
            <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: goldAccent }} />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-black" style={{ backgroundColor: goldAccent }}>
              Best Value
            </div>

            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <h3 className={clsx("text-xl font-black", isDark ? "text-white" : "text-zinc-900")}>Pro+</h3>
                <p className={clsx("text-xs mt-1", mutedText)}>For high volume</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black" style={{ color: goldAccent }}>$19.99</span>
                <p className={clsx("text-[9px] uppercase font-bold", subtleText)}>/ month</p>
              </div>
            </div>

            <div className="h-px w-full bg-[#D4AF37]/20 mb-6" />

            <ul className="space-y-4 text-sm mb-8">
              <li className={clsx("flex items-center gap-3 font-bold", isDark ? "text-white" : "text-zinc-900")}>
                <CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> 300 credits / mo
              </li>
              <li className={clsx("flex items-center gap-3 font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>
                <CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> All Pro features
              </li>
              <li className={clsx("flex items-center gap-3 font-medium", isDark ? "text-zinc-300" : "text-zinc-600")}>
                <CheckIcon className="h-5 w-5" style={{ color: goldAccent }} /> Commercial license
              </li>
            </ul>

            {/* Lógica Condicional do Botão Pro+ */}
            {currentPlan === "pro_plus" ? (
              <button disabled className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider cursor-default border-2 opacity-60" style={{ borderColor: goldAccent, color: goldAccent }}>
                Current Plan
              </button>
            ) : (
              <button onClick={() => handleCheckout("pro_plus")} disabled={isBusy} className="w-full rounded-xl py-4 font-black text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95 relative overflow-hidden group hover:brightness-110" style={{ background: `linear-gradient(to right, ${goldAccent}, #B6922E)` }}>
                <span className="relative z-10">{busy === "checkout_pro_plus" ? "Redirecting..." : "Upgrade to Pro+"}</span>
              </button>
            )}
          </div>

        </div>

        {/* --- RODAPÉ DE PAGAMENTO E SEGURANÇA --- */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-zinc-200/10 text-center space-y-4">
          <button onClick={handlePortal} disabled={isBusy} className={clsx("text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-current pb-0.5", isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900")}>
            {busy === "portal" ? "Opening..." : "ALREADY SUBSCRIBED? MANAGE BILLING"}
          </button>

          <div className={clsx("text-xs leading-relaxed max-w-lg mx-auto md:opacity-70", isDark ? "text-white md:text-zinc-500" : "text-zinc-600 md:text-zinc-500")}>
            <p className="mb-1">Secure payments by Stripe. Cancel anytime.</p>
            <p>After upgrade, credits become available automatically.</p>
          </div>
        </div>

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

          <Link href="/gallery" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <GalleryIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Gallery
            </span>
          </Link>

          <Link href="/upgrade" className="flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all hover:-translate-y-1">
            <StarIcon className="h-6 w-6 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
              Upgrade
            </span>
            <div className="h-1 w-1 bg-[#D4AF37] rounded-full absolute -bottom-1" />
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 min-w-[50px] group transition-all hover:-translate-y-1">
            <UserIcon className={clsx("h-6 w-6 transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-widest block", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")}>
              Profile
            </span>
          </Link>
        </nav>
      </div>

    </main>
  );
}