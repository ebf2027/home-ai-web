"use client";

import type React from "react";
import { addToGallery } from "./lib/galleryStorage";
import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Icons (premium) ---------- */
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
function DotsIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  );
}
function clsx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

/* ---------- helpers ---------- */
function openImageInNewTab(urlOrData: string) {
  if (urlOrData.startsWith("blob:") || urlOrData.startsWith("http")) {
    window.open(urlOrData, "_blank", "noopener,noreferrer");
    return;
  }
  if (urlOrData.startsWith("data:")) {
    const [meta, b64] = urlOrData.split(",");
    const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/png";

    const byteChars = atob(b64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);

    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  window.open(urlOrData, "_blank", "noopener,noreferrer");
}

async function prepareImageForUpload(
  file: File,
  opts?: { maxDim?: number; quality?: number }
): Promise<File> {
  const maxDim = opts?.maxDim ?? 1024;
  const quality = opts?.quality ?? 0.85;

  const img = document.createElement("img");
  img.decoding = "async";

  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.src = objectUrl;
    });

    const { width, height } = img;
    if (!width || !height) return file;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        "image/jpeg",
        quality
      );
    });

    const newName = file.name.replace(/\.[^.]+$/, "") + `-opt-${targetW}x${targetH}.jpg`;
    return new File([blob], newName, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/* ---------- Before/After Slider ---------- */
function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  isDark,
}: {
  beforeSrc: string;
  afterSrc: string;
  isDark: boolean;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  function updateFromClientX(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setPos(clamp(pct));
  }

  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden rounded-xl border select-none touch-none",
        isDark ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-50"
      )}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        setDragging(true);
        updateFromClientX(e);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        updateFromClientX(e);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      style={{ height: 260 }}
      role="application"
      aria-label="Before and after comparison"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt="Before"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt="After" className="h-full w-full object-cover" draggable={false} />
      </div>

      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
        Before
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
        After
      </div>

      <div className="absolute top-0 z-20 h-full" style={{ left: `calc(${pos}% - 1px)` }}>
        <div className="h-full w-[2px] bg-white/90 shadow" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <div className="flex items-center gap-1 text-zinc-900">
            <span className="text-lg leading-none">‹</span>
            <span className="text-lg leading-none">›</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] text-white">
        Drag to compare
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const STYLES = [
  { id: "Modern", title: "Modern", desc: "Clean lines, bold contrasts, contemporary feel." },
  { id: "Minimalist", title: "Minimalist", desc: "Less clutter, calm palette, functional layout." },
  { id: "Scandinavian", title: "Scandinavian", desc: "Light woods, cozy textures, bright and airy." },
  { id: "Japanese", title: "Japanese", desc: "Minimal harmony, natural wood, zen atmosphere." },
  { id: "Rustic", title: "Rustic", desc: "Natural materials, warm tones, handcrafted vibe." },
  { id: "Industrial", title: "Industrial", desc: "Metal, concrete, exposed elements, urban look." },
  { id: "Boho", title: "Boho", desc: "Layered textiles, plants, artistic and eclectic." },
  { id: "Super Luxury", title: "Super Luxury", desc: "Premium materials, refined lighting, high-end design." },
] as const;

type StyleId = (typeof STYLES)[number]["id"];
type Theme = "light" | "dark";

async function readApiError(res: Response): Promise<string> {
  // tenta ler {error:"..."} do backend
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      if (j?.error) return String(j.error);
    }
  } catch {}
  // fallback: texto cru
  try {
    const t = await res.text();
    if (t) return t.slice(0, 250);
  } catch {}
  return `Request failed (status ${res.status}).`;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleId>("Modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // ✅ erro amigável (mostra na tela)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 🔒 manter a última imagem ao trocar de aba (Home ↔ Gallery)
  useEffect(() => {
    const saved = sessionStorage.getItem("homeai_last_result");
    if (saved) setResultUrl(saved);
  }, []);
  useEffect(() => {
    if (resultUrl) sessionStorage.setItem("homeai_last_result", resultUrl);
    else sessionStorage.removeItem("homeai_last_result");
  }, [resultUrl]);

  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";

  // actions menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Load theme
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

  // Save theme
  useEffect(() => {
    try {
      localStorage.setItem("homeai_theme", theme);
    } catch {}
  }, [theme]);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pageBg = isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900";
  const cardBg = isDark ? "bg-white/5 ring-white/10" : "bg-white ring-zinc-200";
  const mutedText = isDark ? "text-white/70" : "text-zinc-600";
  const subtleText = isDark ? "text-white/60" : "text-zinc-500";
  const previewBoxBg = isDark ? "bg-black/40 ring-white/10" : "bg-zinc-100 ring-zinc-200";

  function clearResult() {
    setMenuOpen(false);
    setErrorMsg(null);
    setResultUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function downloadResult() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `homeai-${selectedStyle.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function shareResult() {
    if (!resultUrl) return;

    try {
      if (navigator.share) {
        const blob = await fetch(resultUrl).then((r) => r.blob());
        const file = new File([blob], `homeai-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });

        // @ts-ignore
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Home AI", text: "My redesign" });
          return;
        }

        await navigator.share({ title: "Home AI", text: "My redesign", url: resultUrl });
        return;
      }
    } catch {
      // fallthrough to open
    }

    openImageInNewTab(resultUrl);
  }

  async function onGenerate() {
    // 🔒 trava clique duplo
    if (isGenerating) return;
    if (!file) return;

    setMenuOpen(false);
    setErrorMsg(null);

    try {
      setIsGenerating(true);
      clearResult();

      const optimized = await prepareImageForUpload(file, { maxDim: 1024, quality: 0.85 });

      const formData = new FormData();
      formData.append("style", selectedStyle);
      formData.append("image", optimized);

      const res = await fetch("/api/generate", { method: "POST", body: formData });

      if (!res.ok) {
        const msg = await readApiError(res);
        setErrorMsg(msg || "Generation failed. Please try again.");
        return;
      }

      const blob = await res.blob();

      // converte blob -> dataURL (não some ao mudar de aba)
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to convert image"));
        reader.readAsDataURL(blob);
      });

      setResultUrl(dataUrl);

      // ✅ salva na gallery
      addToGallery({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        roomType: "Room",
        style: selectedStyle,
        prompt: "Generated image",
        thumbUrl: dataUrl,
        imageUrl: dataUrl,
        isFavorite: false,
      });
    } catch (err) {
      console.error("Generate error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className={clsx("min-h-screen", pageBg)}>
      <div className="mx-auto max-w-md px-4 pb-6">
        {/* Header */}
        <header className="pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm",
                isDark ? "bg-white/10 text-white" : "bg-zinc-900/5 text-zinc-900"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Home AI • beta
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
              disabled={isGenerating}
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight">Redesign your space with AI</h1>
          <p className={clsx("mt-2", mutedText)}>
            Upload a room photo and generate design variations in different styles.
          </p>
        </header>

        {/* Card */}
        <section className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
          {/* Upload row */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your photo</h2>

            <label
              className={clsx(
                "cursor-pointer rounded-full px-3 py-1 text-sm transition",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-zinc-900/5 hover:bg-zinc-900/10",
                isGenerating && "opacity-60 pointer-events-none"
              )}
            >
              Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setErrorMsg(null);
                  clearResult();
                }}
              />
            </label>
          </div>

          {/* Preview / Slider */}
          <div className={clsx("mt-4 overflow-hidden rounded-xl ring-1", previewBoxBg)}>
            {!previewUrl && !resultUrl ? (
              <div className={clsx("flex h-64 items-center justify-center text-center", subtleText)}>
                <p className="text-sm">Select an image to see the preview here</p>
              </div>
            ) : previewUrl && !resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="h-64 w-full object-cover" />
            ) : previewUrl && resultUrl ? (
              <BeforeAfterSlider beforeSrc={previewUrl} afterSrc={resultUrl} isDark={isDark} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl!} alt="Result" className="h-64 w-full object-cover" />
            )}

            {/* Loading overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div className="rounded-full bg-black/55 px-4 py-2 text-sm text-white">
                  Generating…
                </div>
              </div>
            )}
          </div>

          {/* Error box */}
          {errorMsg && (
            <div
              className={clsx(
                "mt-3 rounded-xl border px-3 py-2 text-sm",
                isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {errorMsg}
            </div>
          )}

          {/* Actions: Download + Menu */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={clsx(
                "flex-1 rounded-xl py-3 font-semibold transition",
                !resultUrl || isGenerating
                  ? isDark
                    ? "bg-white/15 text-white/50 cursor-not-allowed"
                    : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                  : isDark
                  ? "bg-white text-zinc-950 hover:bg-white/90"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
              disabled={!resultUrl || isGenerating}
              onClick={downloadResult}
            >
              Download
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className={clsx(
                  "h-12 w-12 rounded-xl border transition flex items-center justify-center",
                  !resultUrl || isGenerating
                    ? isDark
                      ? "border-white/10 text-white/40 cursor-not-allowed"
                      : "border-zinc-200 text-zinc-400 cursor-not-allowed"
                    : isDark
                    ? "border-white/15 text-white hover:bg-white/10"
                    : "border-zinc-200 text-zinc-900 hover:bg-zinc-100"
                )}
                disabled={!resultUrl || isGenerating}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Actions"
                title="Actions"
              >
                <DotsIcon className="h-5 w-5" />
              </button>

              {menuOpen && resultUrl && !isGenerating && (
                <div
                  className={clsx(
                    "absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border shadow-lg",
                    isDark
                      ? "border-white/15 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-900"
                  )}
                >
                  <button
                    className={clsx(
                      "w-full px-3 py-2 text-left text-sm hover:bg-black/5",
                      isDark && "hover:bg-white/10"
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      shareResult();
                    }}
                  >
                    Share
                  </button>
                  <button
                    className={clsx(
                      "w-full px-3 py-2 text-left text-sm hover:bg-black/5",
                      isDark && "hover:bg-white/10"
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      openImageInNewTab(resultUrl);
                    }}
                  >
                    Open
                  </button>
                  <button
                    className={clsx(
                      "w-full px-3 py-2 text-left text-sm hover:bg-black/5",
                      isDark && "hover:bg-white/10"
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      clearResult();
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Styles */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Choose a style</h3>

            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => {
                const isSelected = style.id === selectedStyle;
                const imgKey = style.id.toLowerCase().replace(/\s+/g, "-");
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={isGenerating}
                    className={clsx(
                      "group relative w-full overflow-hidden rounded-xl border px-4 py-4 text-left transition bg-center bg-cover",
                      isSelected
                        ? isDark
                          ? "border-white/40 ring-2 ring-white/15"
                          : "border-zinc-400 ring-2 ring-zinc-300"
                        : isDark
                        ? "border-white/10 hover:border-white/30"
                        : "border-zinc-200 hover:border-zinc-400",
                      isGenerating && "opacity-70 cursor-not-allowed"
                    )}
                    style={{ backgroundImage: `url(/styles/${imgKey}.jpg)` }}
                  >
                    <div
                      className={clsx(
                        "absolute inset-0 transition",
                        isSelected ? "bg-black/45" : "bg-black/50 group-hover:bg-black/40"
                      )}
                    />
                    <div className="relative z-10">
                      <div className="text-sm font-semibold text-white">{style.title}</div>
                      <div className="mt-1 text-xs leading-snug text-white/80">{style.desc}</div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-white/15">
                        <div
                          className={clsx(
                            "h-1.5 rounded-full transition-all",
                            isSelected ? "w-full bg-white/75" : "w-1/3 bg-white/25 group-hover:w-2/3"
                          )}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className={clsx("mt-2 text-xs", subtleText)}>
              Selected:{" "}
              <span className={isDark ? "text-white" : "text-zinc-900"}>{selectedStyle}</span>
            </p>
          </div>

          {/* Generate */}
          <button
            className={clsx(
              "mt-4 w-full rounded-xl py-3 font-semibold transition",
              !file || isGenerating
                ? isDark
                  ? "bg-white/20 text-white/60 cursor-not-allowed"
                  : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                : isDark
                ? "bg-white text-zinc-950 hover:bg-white/90"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            disabled={!file || isGenerating}
            onClick={onGenerate}
          >
            {isGenerating ? "Generating..." : "Generate Design"}
          </button>

          <p className={clsx("mt-3 text-xs", isDark ? "text-white/50" : "text-zinc-500")}>
            Tip: Use a clear room photo with good lighting for best results.
          </p>
        </section>
      </div>
    </main>
  );
}
