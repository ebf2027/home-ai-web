"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/gallery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    router.push(next);
    router.refresh();
  }

  async function signUpWithEmail() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    setMsg("Account created. You can sign in now.");
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) setMsg(error.message);
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Use your email/password or continue with Google.
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-6 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-400">OR</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={signInWithEmail} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border px-4 py-3 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border px-4 py-3 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign in"}
        </button>

        <button
          type="button"
          onClick={signUpWithEmail}
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
