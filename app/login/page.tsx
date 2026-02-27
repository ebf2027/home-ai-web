"use client";

import type React from "react";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useTheme } from "../components/ThemeProvider";
import clsx from "clsx";

// --- Ícone Google Premium ---
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
function SparklesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14.5 9L21 10L16 14.5L17.5 21L12 18L6.5 21L8 14.5L3 10L9.5 9L12 3Z" fill="#3B82F6" />
      <path d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z" fill="#60A5FA" />
    </svg>
  );
}
function LoginForm() {
  const { isDark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const refCode = searchParams.get("ref");

  // "Agarra" o código de indicação do amigo e salva na memória secreta do navegador
  useEffect(() => {
    if (refCode) {
      localStorage.setItem("homerenovai_ref", refCode);
    }
  }, [refCode]);

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">(refCode ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const goldAccent = "#D4AF37";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;
        if (data?.user) router.replace(next);
      } catch (e) {
        console.error("Auto-login check failed", e);
      }
    })();
    return () => { alive = false; };
  }, [supabase, router, next]);

  async function onGoogle() {
    setMsg(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) setMsg(error.message);
    } catch (e: any) {
      setMsg(e?.message ?? "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setMsg("Please enter your email and password.");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setMsg(error.message); return; }
        router.replace(next);
        return;
      }

      // No momento do Cadastro (SignUp)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) { setMsg(error.message); return; }

      // MÁGICA: Se o Supabase já logou o usuário (porque desligamos a confirmação), ele entra direto!
      if (data?.user && data?.session) {
        router.replace(next);
      } else {
        // Se a confirmação de e-mail ainda estiver ligada lá no painel do Supabase
        setMsg("Account created! Please check your email to confirm.");
      }

    } catch (e: any) {
      setMsg(e?.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={clsx("min-h-screen transition-colors duration-500 flex items-center justify-center relative overflow-hidden", isDark ? "bg-[#0A0A0A] text-white" : "bg-zinc-50 text-zinc-900")}>

      {/* Glow de fundo luxuoso no modo Dark */}
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      )}

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <div className={clsx("rounded-[2.5rem] p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border transition-all duration-700", isDark ? "bg-zinc-900/40 border-white/10" : "bg-white border-zinc-100")}>

          {/* --- INÍCIO: Logo HomeRenovAi (Visível em todos os dispositivos) --- */}
          <div className="flex justify-center mb-8 pt-4">
            <h1 className="text-4xl font-black tracking-tighter flex items-center">
              <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
              <span className="text-blue-500">RenovAi</span>
              <SparklesIcon className="h-9 w-9 ml-1" />
            </h1>
          </div>
          {/* --- FIM: Logo HomeRenovAi --- */}

          <header className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-3">
              {mode === "signin" ? "Welcome Back" : "Start Creating"}
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40">
              Your AI-powered interior design studio awaits.
            </p>
          </header>

          {/* Botão Google - Prata/Cinza no modo Light */}
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className={clsx(
              "w-full flex items-center justify-center gap-4 rounded-2xl border py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group relative overflow-hidden shadow-md",
              loading ? "opacity-50 cursor-not-allowed" : "",
              isDark
                ? "border-white/10 text-white bg-white/5 hover:bg-white/10"
                : "border-zinc-200 text-zinc-900 bg-zinc-100 hover:bg-zinc-200"
            )}
          >
            <GoogleIcon />
            <span className="relative z-10">Continue with Google</span>
            <div className="absolute inset-0 w-1/2 h-full skew-x-[-25deg] bg-white/10 -left-full group-hover:left-[150%] transition-all duration-1000 ease-in-out" />
          </button>

          <div className="my-10 flex items-center gap-5 opacity-10">
            <div className="h-px flex-1 bg-current" />
            <span className="text-[9px] font-black uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-current" />
          </div>

          <form onSubmit={onEmailSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-40">Email Address</label>
              <input
                id="email-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                placeholder="seu-email@exemplo.com"
                className={clsx(
                  "w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all focus:ring-1",
                  isDark ? "bg-black border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]" : "bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400 shadow-inner"
                )}
                style={{ fontSize: '16px' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-40">Password</label>
              <input
                id="password-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className={clsx(
                  "w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all focus:ring-1",
                  isDark ? "bg-black border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]" : "bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400 shadow-inner"
                )}
                style={{ fontSize: '16px' }}
              />
            </div>

            {msg && (
              <div className={clsx(
                "rounded-2xl border px-4 py-3 text-[10px] text-center font-black uppercase tracking-widest backdrop-blur-sm",
                // Se a mensagem for de sucesso (contém "created")
                msg.includes("created")
                  ? (isDark
                    ? "bg-green-500/10 border-green-500/20 text-green-400" // Verde translúcido no Dark
                    : "bg-green-50/50 border-green-200 text-green-700"    // Verde translúcido no Light
                  )
                  // Se for qualquer outra mensagem (erro)
                  : (isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50/50 border-red-200 text-red-700"
                  )
              )}>
                {msg}
              </div>
            )}

            {/* Botão de Ação com Efeito Shimmer Dourado */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-5 font-black text-[11px] uppercase tracking-[0.3em] text-black shadow-2xl transition-all active:scale-95 mt-4 relative overflow-hidden group border-none"
              style={{ background: `linear-gradient(to right, ${goldAccent}, #B6922E)` }}
            >
              <span className="relative z-10">{loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}</span>
              <div className="absolute inset-0 w-1/2 h-full skew-x-[-25deg] bg-white/30 -left-full group-hover:left-[150%] transition-all duration-700 ease-in-out" />
            </button>
          </form>

          {/* Seletor de modo (SignIn / SignUp) */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
              className={clsx("text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-70", isDark ? "text-zinc-500" : "text-zinc-400")}
            >
              {mode === "signin" ? (
                <>New here? <span style={{ color: goldAccent }}>Create an account</span></>
              ) : (
                <>Already have an account? <span style={{ color: goldAccent }}>Sign in</span></>
              )}
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">Secure Encryption • Built for Excellence</p>
        </footer>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#D4AF37] font-black uppercase tracking-widest">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}