"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import clsx from "clsx";
import type React from "react"; // Adicionado para tipagem correta

// --- Tipos ---
type Plan = "pro" | "pro_plus";
type Busy = null | "checkout_pro" | "checkout_pro_plus" | "portal";

// --- Ícones ---
function SunIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>;
}
function MoonIcon({ className = "" }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
}
// CORREÇÃO AQUI: Adicionado suporte para 'style'
function CheckIcon({ className = "", style }: { className?: string, style?: React.CSSProperties }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M20 6 9 17l-5-5" /></svg>;
}

// --- Função Auxiliar do Stripe ---
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
  // Conecta ao tema global
  const { isDark, toggleTheme } = useTheme();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const isBusy = busy !== null;

  // Estilos dinâmicos
  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const subtleText = isDark ? "text-zinc-500" : "text-zinc-500";
  const goldAccent = "#D4AF37";

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
    <main className={clsx("min-h-screen transition-colors duration-300 pb-24", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="mx-auto max-w-md px-4 pt-6">

        {/* --- CABEÇALHO (Recuperado) --- */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className={clsx("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-600")}>Home AI</span>
              <span className={subtleText}>/</span>
              <span className={clsx("text-xs font-bold uppercase tracking-wider", goldAccent && `text-[${goldAccent}]`)}>Upgrade</span>
            </div>
            {/* Botão de Tema Global */}
            <button
              onClick={toggleTheme}
              className={clsx("flex h-9 w-9 items-center justify-center rounded-full border transition", isDark ? "border-white/10 text-white hover:bg-white/10" : "border-zinc-200 text-zinc-900 hover:bg-zinc-100")}
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">Choose your plan</h1>
          <p className={mutedText}>Credits reset every billing cycle and do not roll over.</p>

          {/* Links de Navegação */}
          <div className="flex items-center gap-3 mt-6">
            <Link href="/" className={clsx("text-sm font-medium transition-colors", isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black")}>← Back to Home</Link>
            <Link href="/gallery" className={clsx("text-sm font-medium transition-colors", isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black")}>View Gallery</Link>
          </div>
        </header>

        {/* Banner de Erro */}
        {error && (
          <div className={clsx("mb-6 rounded-xl p-4 text-sm text-center border", isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700")}>
            {error}
          </div>
        )}

        {/* --- CARTÕES DE PLANOS --- */}
        <div className="space-y-4">

          {/* Plan FREE (Recuperado e Estilizado) */}
          <div className={clsx("rounded-2xl p-5 border transition-all", isDark ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200")}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Free</h3>
                <p className={clsx("text-xs", mutedText)}>Perfect to try it out</p>
              </div>
              <span className="text-xl font-black">$0</span>
            </div>
            <ul className={clsx("space-y-2.5 text-sm", subtleText)}>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 opacity-70" /> 3 total credits included</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 opacity-70" /> Standard quality</li>
            </ul>
          </div>

          {/* Plan PRO (Design Luxo) */}
          <div className={clsx("rounded-2xl p-6 border-2 transition-all relative", isDark ? "bg-zinc-900/80 border-zinc-800/60" : "bg-white border-zinc-200")}>
            {isDark && <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>}
            <div className="flex justify-between items-start mb-4 relative">
              <div>
                <h3 className="text-lg font-black" style={{ color: isDark ? goldAccent : 'inherit' }}>Pro</h3>
                <p className={clsx("text-xs", mutedText)}>Best for daily use</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black">$9.99</span>
                <p className={clsx("text-[10px] uppercase font-bold", subtleText)}>/ month</p>
              </div>
            </div>
            <ul className="space-y-3 mb-6 relative">
              <li className="flex items-center gap-3 text-sm font-medium"><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> 100 credits per month</li>
              <li className="flex items-center gap-3 text-sm font-medium"><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> Priority generation</li>
              <li className="flex items-center gap-3 text-sm font-medium"><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> Premium Styles</li>
            </ul>
            <button onClick={() => handleCheckout("pro")} disabled={isBusy} className={clsx("w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 relative", isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black")}>
              {busy === "checkout_pro" ? "Redirecting..." : "Upgrade to Pro"}
            </button>
          </div>

          {/* Plan PRO+ (Design Luxo Destaque) */}
          <div className={clsx("rounded-2xl p-6 border-2 relative overflow-hidden transition-all", isDark ? "bg-zinc-900" : "bg-zinc-50")} style={{ borderColor: goldAccent }}>
            <div className="absolute top-0 right-0 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider" style={{ backgroundColor: goldAccent }}>Best Value</div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black">Pro+</h3>
                <p className={clsx("text-xs", mutedText)}>For high volume</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black" style={{ color: goldAccent }}>$19.99</span>
                <p className={clsx("text-[10px] uppercase font-bold", subtleText)}>/ month</p>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm font-bold"><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> 300 credits per month</li>
              <li className="flex items-center gap-3 text-sm font-medium" style={{ color: mutedText }}><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> All Pro features</li>
              <li className="flex items-center gap-3 text-sm font-medium" style={{ color: mutedText }}><CheckIcon className="h-4 w-4" style={{ color: goldAccent }} /> Commercial license</li>
            </ul>
            <button onClick={() => handleCheckout("pro_plus")} disabled={isBusy} className="w-full rounded-xl py-3.5 font-black text-white shadow-lg transition-all active:scale-95 relative overflow-hidden" style={{ background: `linear-gradient(to right, ${goldAccent}, #B6922E)` }}>
              <span className="relative z-10">{busy === "checkout_pro_plus" ? "Redirecting..." : "Upgrade to Pro+"}</span>
            </button>
          </div>
        </div>

        {/* --- RODAPÉ (Gerenciar e FAQ) --- */}
        <footer className="mt-10 pt-6 border-t border-zinc-200/10 text-center space-y-6">
          <div>
            <button onClick={handlePortal} disabled={isBusy} className={clsx("text-xs font-bold uppercase tracking-widest transition-colors", isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900")}>
              {busy === "portal" ? "Opening..." : "Already subscribed? Manage Billing"}
            </button>
          </div>
          <p className={clsx("text-xs", subtleText)}>
            Secure payments by Stripe. Cancel anytime. <br />After upgrade, credits become available automatically.
          </p>
        </footer>

      </div>
    </main>
  );
}