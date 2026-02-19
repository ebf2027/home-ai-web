"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function clsx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

// --- Ícones Premium Padronizados ---
function HomeIcon({ active, isDark }: { active: boolean; isDark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? (isDark ? "text-[#D4AF37]" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-500"))} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GalleryIcon({ active, isDark }: { active: boolean; isDark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? (isDark ? "text-[#D4AF37]" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-500"))} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function StarIcon({ active, isDark }: { active: boolean; isDark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? (isDark ? "text-[#D4AF37]" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-500"))} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon({ active, isDark }: { active: boolean; isDark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? (isDark ? "text-[#D4AF37]" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-500"))} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  const [isDark, setIsDark] = require("react").useState(false);

  require("react").useEffect(() => {
    // Initial check
    const checkTheme = () => {
      const saved = localStorage.getItem("homeai_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (saved === "dark" || (!saved && prefersDark)) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    };

    checkTheme();

    // Listen for storage changes (cross-tab) and custom event if needed
    window.addEventListener("storage", checkTheme);

    // Observer for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener("storage", checkTheme);
      observer.disconnect();
    };
  }, []);

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
    { href: "/gallery", label: "Gallery", icon: GalleryIcon, match: (p: string) => p.startsWith("/gallery") },
    { href: "/upgrade", label: "Upgrade", icon: StarIcon, match: (p: string) => p.startsWith("/upgrade") },
    { href: "/profile", label: "Profile", icon: UserIcon, match: (p: string) => p.startsWith("/profile") },
  ];

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        isDark ? "bg-zinc-950 border-zinc-800" : "bg-white/90 border-zinc-200",
        "border-t backdrop-blur"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-4 px-2 py-2">
          {tabs.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition",
                  active ? "bg-zinc-900/5 dark:bg-white/10" : "hover:bg-zinc-900/5 dark:hover:bg-white/5"
                )}
              >
                <Icon active={active} isDark={isDark} />
                <div className={clsx("text-[11px] font-black uppercase tracking-widest mt-1", active ? (isDark ? "text-[#D4AF37]" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-500"))}>
                  {t.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomTabs;