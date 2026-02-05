"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";
type Plan = "pro" | "pro_plus";
type Busy = null | "checkout_pro" | "checkout_pro_plus" | "portal";

function clsx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

function SunIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Badge({ children, isDark }: { children: ReactNode; isDark: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        isDark ? "bg-white/10 text-white" : "bg-zinc-900/5 text-zinc-900"
      )}
    >
      {children}
    </span>
  );
}

async function postForRedirectUrl(endpoint: string, body?: any) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    const msg = data?.error || data?.message || "You need to be signed in to continue.";
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const url: string | undefined = data?.url;
  if (!url) throw new Error("Stripe URL not returned by the API.");

  return url;
}

export default function UpgradePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("homeai_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        return;
      }
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      setTheme(prefersDark ? "dark" : "light");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("homeai_theme", theme);
    } catch {}
  }, [theme]);

  const pageBg = isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900";
  const cardBg = isDark ? "bg-white/5 ring-white/10" : "bg-white ring-zinc-200";
  const mutedText = isDark ? "text-white/70" : "text-zinc-600";
  const subtleText = isDark ? "text-white/60" : "text-zinc-500";

  const isBusy = busy !== null;

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
    <main className={clsx("min-h-screen", pageBg)}>
      <div className="mx-auto max-w-md px-4 pb-24">
        {/* Header */}
        <header className="pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge isDark={isDark}>Home AI</Badge>
              <span className={clsx("text-xs", subtleText)}>Upgrade</span>
            </div>

            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
              title="Toggle theme"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full border transition",
                isDark
                  ? "border-white/15 text-white hover:bg-white/10"
                  : "border-zinc-200 text-zinc-900 hover:bg-zinc-100"
              )}
              disabled={isBusy}
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight">Choose your plan</h1>
          <p className={clsx("mt-2", mutedText)}>
            Credits reset every billing cycle and do not roll over. 1 credit = 1 render.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/"
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isDark ? "border-white/15 hover:bg-white/10" : "border-zinc-200 hover:bg-zinc-100"
              )}
            >
              ← Back to Home
            </Link>

            <Link
              href="/gallery"
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isDark ? "border-white/15 hover:bg-white/10" : "border-zinc-200 hover:bg-zinc-100"
              )}
            >
              View Gallery
            </Link>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div
            className={clsx(
              "mb-3 rounded-2xl p-3 text-sm ring-1",
              isDark ? "bg-red-500/10 text-red-200 ring-red-500/20" : "bg-red-50 text-red-700 ring-red-200"
            )}
          >
            {error}
          </div>
        )}

        {/* Cards */}
        <section className="space-y-3">
          {/* Free */}
          <div className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Free</div>
                <div className={clsx("mt-1 text-sm", mutedText)}>Perfect to try it out</div>
              </div>
              <div className={clsx("text-right", mutedText)}>
                <div className="text-lg font-semibold">$0</div>
                <div className="text-xs">forever</div>
              </div>
            </div>

            <ul className={clsx("mt-3 space-y-2 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                3 total credits included
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                +1 credit when you complete your profile
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                +1 credit for each friend you refer (when they qualify)
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Save results to your gallery
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Download designs
              </li>
            </ul>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Free credits are limited and do not renew. 1 credit = 1 render.
            </p>
          </div>

          {/* Pro */}
          <div className={clsx("rounded-2xl p-4 ring-1", isDark ? "bg-white/7 ring-white/15" : "bg-white ring-zinc-300")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Pro</div>
                <div className={clsx("mt-1 text-sm", mutedText)}>Best for creators, real estate, and daily use</div>
              </div>
              <div className={clsx("text-right", mutedText)}>
                <div className="text-lg font-semibold">$9.99</div>
                <div className="text-xs">/ month</div>
              </div>
            </div>

            <ul className={clsx("mt-3 space-y-2 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                100 credits per month
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Priority generation (faster)
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Higher quality output (future toggle)
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Premium styles (future)
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleCheckout("pro")}
              disabled={isBusy}
              className={clsx(
                "mt-4 w-full rounded-xl py-3 font-semibold transition",
                isBusy && "opacity-70 cursor-not-allowed",
                isDark ? "bg-white text-zinc-950 hover:bg-white/90" : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              {busy === "checkout_pro" ? "Redirecting..." : "Upgrade to Pro"}
            </button>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Credits reset every billing cycle and do not roll over. 1 credit = 1 render.
            </p>
          </div>

          {/* Pro+ */}
          <div
            className={clsx(
              "rounded-2xl p-4 ring-1",
              isDark ? "bg-white/9 ring-white/20" : "bg-white ring-zinc-300"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">Pro+</div>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      isDark ? "bg-amber-400/15 text-amber-200" : "bg-amber-100 text-amber-800"
                    )}
                  >
                    Best value
                  </span>
                </div>
                <div className={clsx("mt-1 text-sm", mutedText)}>
                  Built for heavy usage, teams, and high-volume clients
                </div>
              </div>
              <div className={clsx("text-right", mutedText)}>
                <div className="text-lg font-semibold">$19.99</div>
                <div className="text-xs">/ month</div>
              </div>
            </div>

            <ul className={clsx("mt-3 space-y-2 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                300 credits per month
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Priority generation (faster)
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Higher quality output (future toggle)
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Premium styles (future)
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleCheckout("pro_plus")}
              disabled={isBusy}
              className={clsx(
                "mt-4 w-full rounded-xl py-3 font-semibold transition",
                isBusy && "opacity-70 cursor-not-allowed",
                isDark
                  ? "bg-amber-200 text-zinc-950 hover:bg-amber-200/90"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              )}
            >
              {busy === "checkout_pro_plus" ? "Redirecting..." : "Upgrade to Pro+"}
            </button>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Credits reset every billing cycle and do not roll over. 1 credit = 1 render.
            </p>
          </div>

          {/* Manage subscription */}
          <div className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
            <div className="text-sm font-semibold">Already subscribed?</div>
            <p className={clsx("mt-1 text-sm", mutedText)}>
              Manage your subscription, update your payment method, cancel, or view invoices.
            </p>

            <button
              type="button"
              onClick={handlePortal}
              disabled={isBusy}
              className={clsx(
                "mt-3 w-full rounded-xl py-3 font-semibold transition ring-1",
                isBusy && "opacity-70 cursor-not-allowed",
                isDark
                  ? "bg-transparent text-white ring-white/15 hover:bg-white/10"
                  : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50"
              )}
            >
              {busy === "portal" ? "Opening..." : "Manage subscription"}
            </button>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Secure payments by Stripe. You can manage or cancel anytime.
            </p>
          </div>

          {/* FAQ / Notes */}
          <div className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
            <div className="text-sm font-semibold">What happens after I upgrade?</div>
            <p className={clsx("mt-2 text-sm", mutedText)}>
              After payment, your plan is activated by the Stripe webhook and your monthly credits become available
              automatically. Credits reset each billing cycle and do not roll over.
            </p>

            <div className={clsx("mt-4 text-xs", subtleText)}>
              Tip: if you get “You need to be signed in”, log in first and try again.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
