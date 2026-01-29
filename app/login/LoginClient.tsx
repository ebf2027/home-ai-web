"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../lib/supabase/client";

function clsx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If already logged in, redirect to next
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      if (data?.user) router.replace(next);
    })();
    return () => {
      alive = false;
    };
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
      // success will redirect automatically
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
        if (error) {
          setMsg(error.message);
          return;
        }
        router.replace(next);
        return;
      }

      // signup
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      setMsg("Account created. Please check your email to confirm your account.");
    } catch (e: any) {
      setMsg(e?.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-1 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Home AI • beta
          </div>

          <h1 className="mt-4 text-2xl font-semibold">Welcome</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Sign in to access your gallery and generate designs.
          </p>

          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className={clsx(
              "mt-5 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition",
              loading ? "cursor-not-allowed opacity-70" : "hover:bg-zinc-50",
              "border-zinc-200 bg-white"
            )}
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <div className="text-xs text-zinc-400">OR</div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={onEmailSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-zinc-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-zinc-300"
              />
            </div>

            {msg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full rounded-xl py-3 font-semibold transition",
                loading
                  ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-600">
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMsg(null);
                }}
                className="underline underline-offset-2"
              >
                Create an account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setMsg(null);
                }}
                className="underline underline-offset-2"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>

          <div className="mt-4 text-xs text-zinc-400">
            Redirect after login: <span className="font-mono">{next}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
