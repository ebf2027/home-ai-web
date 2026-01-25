"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function clsx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? "text-zinc-900" : "text-zinc-500")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? "text-zinc-900" : "text-zinc-500")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v7h-7z" />
      <path d="M4 13h7v7H4z" />
      <path d="M13 13h7v7h-7z" />
    </svg>
  );
}
function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? "text-zinc-900" : "text-zinc-500")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7 7 .5-5.5 4.5L18 22l-6-3.5L6 22l1.5-8L2 9.5 9 9z" />
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", active ? "text-zinc-900" : "text-zinc-500")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  );
}

export function BottomTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
    { href: "/gallery", label: "Gallery", icon: GridIcon, match: (p: string) => p.startsWith("/gallery") },
    { href: "/upgrade", label: "Upgrade", icon: StarIcon, match: (p: string) => p.startsWith("/upgrade") },
    { href: "/profile", label: "Profile", icon: UserIcon, match: (p: string) => p.startsWith("/profile") },
  ];

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t border-zinc-200 bg-white/90 backdrop-blur"
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
                  active ? "bg-zinc-900/5" : "hover:bg-zinc-900/5"
                )}
              >
                <Icon active={active} />
                <div className={clsx("text-[11px]", active ? "text-zinc-900" : "text-zinc-500")}>
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
