"use client";

import { createClient } from "./lib/supabase/client";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const ROOM_TYPES = [
  { value: "living_room", label: "Living room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "balcony", label: "Balcony" },
  { value: "home_theater", label: "Home theater" },
  { value: "store", label: "Store" },
  { value: "house_facade", label: "House facade" },
  { value: "other", label: "Other" },
] as const;

const ROOM_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  ROOM_TYPES.map((r) => [r.value, r.label])
);

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
function LightbulbIcon({ className = "" }) {
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
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8 14c-1.2-1.2-2-2.9-2-4.8A6 6 0 0 1 12 3a6 6 0 0 1 6 6.2c0 1.9-.8 3.6-2 4.8-.9.9-1.6 2-1.8 3H9.8c-.2-1-1-2.1-1.8-3Z" />
    </svg>
  );
}
function CameraIcon({ className = "" }) {
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
      <path d="M4 7h3l2-2h6l2 2h3v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
function UploadIcon({ className = "" }) {
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
      <path d="M12 3v10" />
      <path d="M8 7l4-4 4 4" />
      <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </svg>
  );
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
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      if (j?.error) return String(j.error);
    }
  } catch {}
  try {
    const t = await res.text();
    if (t) return t.slice(0, 250);
  } catch {}
  return `Request failed (status ${res.status}).`;
}

async function blobToJpegThumb(blob: Blob, opts?: { maxDim?: number; quality?: number }) {
  const maxDim = opts?.maxDim ?? 420;
  const quality = opts?.quality ?? 0.8;

  const img = document.createElement("img");
  img.decoding = "async";

  const objectUrl = URL.createObjectURL(blob);
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for thumb"));
      img.src = objectUrl;
    });

    const { width, height } = img;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const thumbBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        "image/jpeg",
        quality
      );
    });

    return thumbBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getPublicUrlFromBucket(supabase: any, bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl as string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleId>("Modern");
  const [roomType, setRoomType] = useState<string>(""); // ✅ dropdown state
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // ✅ Photo tips modal
  const [tipsOpen, setTipsOpen] = useState(false);

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

  // ✅ camera + upload inputs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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

  const currentStep = isGenerating ? 3 : resultUrl ? 3 : file ? 2 : 1;

  function clearResult() {
    setMenuOpen(false);
    setErrorMsg(null);
    setResultUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function handlePickedImage(f: File | null) {
    if (!f) return;
    clearResult();
    setFile(f);
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    handlePickedImage(f);

    // ✅ important for iOS: allow picking the same file again
    e.currentTarget.value = "";
  };

  const openCamera = () => cameraInputRef.current?.click();
  const openUpload = () => uploadInputRef.current?.click();

  function downloadResult() {
    if (!resultUrl) return;

    const filename = `homeai-${selectedStyle.toLowerCase().replace(/\s+/g, "-")}.jpg`;

    (async () => {
      try {
        if (resultUrl.startsWith("data:")) {
          const a = document.createElement("a");
          a.href = resultUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        }

        const res = await fetch(resultUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      } catch (e) {
        window.open(resultUrl, "_blank", "noopener,noreferrer");
      }
    })();
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
    } catch {}

    openImageInNewTab(resultUrl);
  }

  async function onGenerate() {
    if (isGenerating) return;
    if (!file) return;

    setMenuOpen(false);
    setErrorMsg(null);

    try {
      setIsGenerating(true);
      clearResult();

      const optimized = await prepareImageForUpload(file, { maxDim: 1024, quality: 0.85 });

      const roomTypeToSend = roomType || "other"; // ✅ sempre manda algo

      const formData = new FormData();
      formData.append("style", selectedStyle);
      formData.append("roomType", roomTypeToSend); // ✅ envia para a API
      formData.append("image", optimized);

      const res = await fetch("/api/generate", { method: "POST", body: formData });

      if (!res.ok) {
        const msg = await readApiError(res);
        setErrorMsg(msg || "Generation failed. Please try again.");
        return;
      }

      const finalBlob = await res.blob();

      const supabase = createClient();
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setErrorMsg("You must be logged in to save to your gallery.");
        return;
      }

      const userId = userData.user.id;
      const imageId = crypto.randomUUID();

      const thumbBlob = await blobToJpegThumb(finalBlob, { maxDim: 420, quality: 0.8 });

      const bucket = "homeai";
      const imagePath = `${userId}/${imageId}.jpg`;
      const thumbPath = `${userId}/${imageId}-thumb.jpg`;

      const imageFile = new File([finalBlob], `${imageId}.jpg`, { type: "image/jpeg" });
      const thumbFile = new File([thumbBlob], `${imageId}-thumb.jpg`, { type: "image/jpeg" });

      const up1 = await supabase.storage.from(bucket).upload(imagePath, imageFile, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (up1.error) {
        console.error(up1.error);
        setErrorMsg("Failed to upload image to storage.");
        return;
      }

      const up2 = await supabase.storage.from(bucket).upload(thumbPath, thumbFile, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (up2.error) {
        console.error(up2.error);
        setErrorMsg("Failed to upload thumbnail to storage.");
        return;
      }

      const imageUrl = getPublicUrlFromBucket(supabase, bucket, imagePath);
      const thumbUrl = getPublicUrlFromBucket(supabase, bucket, thumbPath);

      const roomTypeLabel = ROOM_TYPE_LABEL[roomTypeToSend] ?? roomTypeToSend;

      const ins = await supabase.from("gallery_items").insert({
        id: imageId,
        user_id: userId,
        room_type: roomTypeLabel, // ✅ salva no DB
        style: selectedStyle,
        prompt: `Style: ${selectedStyle} | Room: ${roomTypeLabel}`,
        image_url: imageUrl,
        thumb_url: thumbUrl,
        is_favorite: false,
      });

      if (ins.error) {
        console.error(ins.error);
        setErrorMsg("Saved image in storage, but failed to save in database.");
        return;
      }

      setResultUrl(imageUrl);
    } catch (err) {
      console.error("Generate error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function StepPill({
    n,
    title,
    desc,
  }: {
    n: number;
    title: string;
    desc: string;
  }) {
    const done = currentStep > n;
    const active = currentStep === n;

    const base = "rounded-xl border px-3 py-2 transition";
    const doneCls = isDark
      ? "border-emerald-500/25 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50";
    const activeCls = isDark
      ? "border-white/20 bg-white/10"
      : "border-zinc-300 bg-white";
    const todoCls = isDark
      ? "border-white/10 bg-white/5"
      : "border-zinc-200 bg-zinc-50";

    const dotCls = done
      ? "bg-emerald-400"
      : active
      ? isDark
        ? "bg-white/80"
        : "bg-zinc-900"
      : isDark
      ? "bg-white/25"
      : "bg-zinc-300";

    return (
      <div className={clsx(base, done ? doneCls : active ? activeCls : todoCls)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={clsx("h-2 w-2 rounded-full", dotCls)} />
            <div className={clsx("text-xs font-semibold", isDark ? "text-white" : "text-zinc-900")}>
              {n}. {title}
            </div>
          </div>
          {done && (
            <span className={clsx("text-[10px] font-semibold", isDark ? "text-emerald-200" : "text-emerald-700")}>
              Done
            </span>
          )}
          {active && !done && (
            <span className={clsx("text-[10px] font-semibold", isDark ? "text-white/80" : "text-zinc-700")}>
              Now
            </span>
          )}
        </div>
        <div className={clsx("mt-0.5 text-[11px] truncate", subtleText)}>{desc}</div>
      </div>
    );
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
            Take a photo or upload an image, choose a style, then generate a realistic redesign.
          </p>
        </header>

        {/* Card */}
        <section className={clsx("rounded-2xl p-4 ring-1", cardBg)}>
          {/* ✅ Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickFile}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />

          {/* ✅ Steps */}
          <div className="grid grid-cols-3 gap-2">
            <StepPill n={1} title="Photo" desc="Take or upload" />
            <StepPill n={2} title="Style" desc="Pick a look" />
            <StepPill n={3} title="Result" desc={isGenerating ? "Generating…" : "Download & share"} />
          </div>

          {/* Photo header */}
          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Your photo</h2>
              <p className={clsx("mt-0.5 text-xs", subtleText)}>
                {file ? `Selected: ${file.name}` : "JPG or PNG • Good lighting improves results"}
              </p>
            </div>

            {/* Photo tips shortcut */}
            <button
              type="button"
              onClick={() => setTipsOpen(true)}
              className={clsx(
                "shrink-0 inline-flex items-center gap-2 text-xs underline-offset-4 hover:underline",
                isDark ? "text-white/70 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              <LightbulbIcon className="h-4 w-4" />
              Tips
            </button>
          </div>

          {/* ✅ Premium photo pickers with animation */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCamera}
              disabled={isGenerating}
              className={clsx(
                "group relative rounded-2xl border p-3 text-left transition",
                "will-change-transform transform-gpu",
                "active:scale-[0.98] sm:hover:-translate-y-0.5",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-zinc-200 bg-white hover:bg-zinc-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                isGenerating && "opacity-60 cursor-not-allowed"
              )}
            >
              <span
                className={clsx(
                  "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isDark ? "bg-white/10 text-white/80" : "bg-zinc-900/5 text-zinc-700"
                )}
              >
                Recommended
              </span>

              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "rounded-xl p-2 ring-1 transition",
                    isDark
                      ? "bg-white/10 text-white ring-white/10"
                      : "bg-zinc-900/5 text-zinc-900 ring-zinc-200"
                  )}
                >
                  <CameraIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className={clsx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                    Take photo
                  </div>
                  <div className={clsx("mt-0.5 text-xs", subtleText)}>Opens camera • Fast</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={openUpload}
              disabled={isGenerating}
              className={clsx(
                "group relative rounded-2xl border p-3 text-left transition",
                "will-change-transform transform-gpu",
                "active:scale-[0.98] sm:hover:-translate-y-0.5",
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-zinc-200 bg-white hover:bg-zinc-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                isGenerating && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "rounded-xl p-2 ring-1 transition",
                    isDark
                      ? "bg-white/10 text-white ring-white/10"
                      : "bg-zinc-900/5 text-zinc-900 ring-zinc-200"
                  )}
                >
                  <UploadIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className={clsx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                    Upload
                  </div>
                  <div className={clsx("mt-0.5 text-xs", subtleText)}>From Photos or Files</div>
                </div>
              </div>
            </button>
          </div>

          {/* Preview / Slider */}
          <div className={clsx("relative mt-4 overflow-hidden rounded-xl ring-1", previewBoxBg)}>
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
                isDark
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {errorMsg}
            </div>
          )}

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
                      "will-change-transform transform-gpu active:scale-[0.98] sm:hover:-translate-y-0.5",
                      isSelected
                        ? isDark
                          ? "border-white/40 ring-2 ring-white/15"
                          : "border-zinc-400 ring-2 ring-zinc-300"
                        : isDark
                        ? "border-white/10 hover:border-white/30"
                        : "border-zinc-200 hover:border-zinc-400",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
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

            {/* ✅ Room type dropdown */}
            <div className="mt-4">
              <div className="text-xs font-medium text-zinc-400">Room type</div>

              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                disabled={isGenerating}
                className={clsx(
                  "mt-2 w-full rounded-xl border px-3 py-3 text-sm outline-none transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-zinc-100 focus:border-white/20"
                    : "border-zinc-200 bg-white text-zinc-900 focus:border-zinc-300",
                  isGenerating && "opacity-70 cursor-not-allowed"
                )}
              >
                <option value="" disabled>
                  Select a room type
                </option>

                {ROOM_TYPES.map((r) => (
                  <option key={r.value} value={r.value} className={isDark ? "bg-zinc-900" : ""}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate */}
          <button
            className={clsx(
              "mt-4 w-full rounded-xl py-3 font-semibold transition",
              "active:scale-[0.99] transform-gpu will-change-transform",
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

          {/* Actions: Download + Menu */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={clsx(
                "flex-1 rounded-xl py-3 font-semibold transition",
                "active:scale-[0.99] transform-gpu will-change-transform",
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
                  "active:scale-[0.98] transform-gpu will-change-transform",
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

          {/* ✅ Photo tips modal */}
          {tipsOpen && (
            <div className="fixed inset-0 z-[999]">
              <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Close tips"
                onClick={() => setTipsOpen(false)}
              />

              <div
                className="absolute inset-x-0 mx-auto max-w-md px-4 pb-6"
                style={{ bottom: "calc(88px + env(safe-area-inset-bottom))" }}
              >
                <div className={clsx("rounded-2xl p-4 ring-1 shadow-xl", cardBg)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">Photo tips</h3>
                      <p className={clsx("mt-1 text-xs", mutedText)}>
                        A better photo usually means a better redesign.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTipsOpen(false)}
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

                  <ul
                    className={clsx(
                      "mt-3 space-y-2 text-sm",
                      isDark ? "text-white/80" : "text-zinc-700"
                    )}
                  >
                    <li>• Turn on the lights and open the curtains.</li>
                    <li>• Try to capture most of the room (floor + two walls if possible).</li>
                    <li>• Hold the phone level at chest height (avoid tilted shots).</li>
                    <li>• Avoid ultra wide / 0.5× lens (it distorts the room).</li>
                    <li>• Keep doors and windows visible (don’t crop them).</li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => setTipsOpen(false)}
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
        </section>
      </div>
    </main>
  );
}
