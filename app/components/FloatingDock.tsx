"use client";

import Link from "next/link";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";
import { HomeIcon, GalleryIcon, StarIcon, UserIcon } from "./icons";

type FloatingDockProps = {
  activePage: "workspace" | "gallery" | "upgrade" | "profile";
};

const tabs = [
  { href: "/workspace", label: "Home", Icon: HomeIcon, page: "workspace" },
  { href: "/gallery", label: "Gallery", Icon: GalleryIcon, page: "gallery" },
  { href: "/upgrade", label: "Upgrade", Icon: StarIcon, page: "upgrade" },
  { href: "/profile", label: "Profile", Icon: UserIcon, page: "profile" },
] as const;

export default function FloatingDock({ activePage }: FloatingDockProps) {
  const { isDark } = useTheme();

  return (
    <div className="hidden md:flex fixed bottom-6 md:bottom-2 left-0 right-0 z-[100] justify-center pointer-events-none">
      <nav className={clsx(
        "pointer-events-auto flex items-center justify-around gap-6 md:gap-10 px-6 py-4 shadow-2xl backdrop-blur-xl border border-white/10 transition-all",
        "rounded-[2rem]",
        "w-[90%] md:w-auto",
        isDark ? "bg-black/80" : "bg-white/90 border-zinc-200"
      )}>
        {tabs.map((t) => {
          const isActive = t.page === activePage;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all hover:-translate-y-1",
                !isActive && "group"
              )}
            >
              <t.Icon className={clsx(
                "h-6 w-6",
                isActive
                  ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                  : clsx("transition-colors", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")
              )} />
              <span className={clsx(
                "text-[10px] uppercase tracking-widest block",
                isActive
                  ? "font-black text-[#D4AF37]"
                  : clsx("font-bold", isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900")
              )}>
                {t.label}
              </span>
              {isActive && (
                <div className="h-1 w-1 bg-[#D4AF37] rounded-full absolute -bottom-1" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
