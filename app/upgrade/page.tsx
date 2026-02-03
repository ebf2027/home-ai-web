"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

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

function Badge({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
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

export default function UpgradePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";

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

  // 🔧 Por enquanto: CTA “Coming soon”.
  // Depois a gente liga isso no Stripe (checkout + webhook).
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

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
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight">Unlock Pro</h1>
          <p className={clsx("mt-2", mutedText)}>
            Get more generations per day, faster results, and premium quality.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/"
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isDark
                  ? "border-white/15 hover:bg-white/10"
                  : "border-zinc-200 hover:bg-zinc-100"
              )}
            >
              ← Back to Home
            </Link>

            <Link
              href="/gallery"
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isDark
                  ? "border-white/15 hover:bg-white/10"
                  : "border-zinc-200 hover:bg-zinc-100"
              )}
            >
              View Gallery
            </Link>
          </div>
        </header>

        {/* Cards */}
        <section className="space-y-3">
          {/* Free */}
          <div className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Free</div>
                <div className={clsx("mt-1 text-sm", mutedText)}>Great to try the product</div>
              </div>
              <div className={clsx("text-right", mutedText)}>
                <div className="text-lg font-semibold">R$ 0</div>
                <div className="text-xs">forever</div>
              </div>
            </div>

            <ul className={clsx("mt-3 space-y-2 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Daily generation limit (cost protection)
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
          </div>

          {/* Pro */}
          <div className={clsx("rounded-2xl p-4 ring-1", isDark ? "bg-white/7 ring-white/15" : "bg-white ring-zinc-300")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Pro</div>
                <div className={clsx("mt-1 text-sm", mutedText)}>
                  Best for creators, real estate, and daily use
                </div>
              </div>
              <div className={clsx("text-right", mutedText)}>
                <div className="text-lg font-semibold">R$ 29,90</div>
                <div className="text-xs">/ month</div>
              </div>
            </div>

            <ul className={clsx("mt-3 space-y-2 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4" />
                Higher daily limit (or unlimited)
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
              onClick={() => setComingSoonOpen(true)}
              className={clsx(
                "mt-4 w-full rounded-xl py-3 font-semibold transition",
                isDark
                  ? "bg-white text-zinc-950 hover:bg-white/90"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              Upgrade to Pro
            </button>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Payments will be enabled soon (Stripe). This button is already in place.
            </p>
          </div>

          {/* FAQ / Notes */}
          <div className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
            <div className="text-sm font-semibold">What happens after I upgrade?</div>
            <p className={clsx("mt-2 text-sm", mutedText)}>
              Pro will remove the daily free limit and unlock higher quality settings. We’ll also add a
              subscription management button here.
            </p>

            <div className={clsx("mt-4 text-xs", subtleText)}>
              Tip: Next step is connecting this page to Stripe checkout + webhook to mark your account as Pro.
            </div>
          </div>
        </section>
      </div>

      {/* Coming soon modal */}
      {comingSoonOpen && (
        <div className="fixed inset-0 z-[999]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setComingSoonOpen(false)}
          />

          <div className="absolute inset-x-0 top-24 mx-auto max-w-md px-4">
            <div className={clsx("rounded-2xl p-4 ring-1 shadow-xl", cardBg)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Upgrade coming soon</h3>
                  <p className={clsx("mt-1 text-xs", mutedText)}>
                    The UI is ready. Next we’ll connect Stripe checkout + webhook.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setComingSoonOpen(false)}
                  className={clsx(
                    "h-9 w-9 rounded-full border flex items-center justify-center",
                    isDark
                      ? "border-white/15 text-white hover:bg-white/10"
                      : "border-zinc-200 text-zinc-900 hover:bg-zinc-100"
                  )}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className={clsx("mt-3 text-sm", isDark ? "text-white/80" : "text-zinc-700")}>
                Next steps to enable payments:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Add Stripe keys + Price ID</li>
                  <li>• Create checkout endpoint</li>
                  <li>• Webhook to set user as Pro in Supabase</li>
                  <li>• Replace bypass env with “is_pro” from DB</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setComingSoonOpen(false)}
                className={clsx(
                  "mt-4 w-full rounded-xl py-3 font-semibold transition",
                  isDark
                    ? "bg-white text-zinc-950 hover:bg-white/90"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
