"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./components/ThemeProvider";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { createClient } from "./lib/supabase/client";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const supabase = createClient();
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
    
    // Libera a renderização do vídeo apenas após a hidratação total (2.5s) para o Lighthouse de Mobile não penalizar o "Time to Interactive"
    const timer = setTimeout(() => setVideoReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={clsx(
      "min-h-screen transition-colors duration-500 font-sans overflow-x-hidden", 
      isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F4F4F5] text-zinc-900"
    )}>
      {/* Schema.org VideoObject Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "HomeRenovAi In Action",
            "description": "Watch how our AI transforms old spaces into breathtaking luxury designs in seconds.",
            "thumbnailUrl": "https://homerenovai.com/OG_1200x630_.jpg",
            "uploadDate": "2026-04-09",
            "contentUrl": "https://homerenovai.com/16X9_HomeRenovAi_720P.mp4"
          })
        }}
      />
      
      {/* HEADER DA VITRINE */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter font-serif">
            <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
            <span className="text-blue-500">RenovAi</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme} 
            className={clsx(
              "p-2 rounded-full transition-all duration-300 border",
              isDark 
                ? "bg-zinc-900 border-white/10 text-yellow-400 hover:bg-white/5" 
                : "bg-white border-zinc-200 text-zinc-900 shadow-sm hover:bg-zinc-50"
            )}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* --- VIDEO SHOWCASE (Primeiro impacto visual) --- */}
      <section className="relative pt-24 md:pt-40 px-6 pb-0 flex flex-col items-center">
        <div className="relative w-full max-w-6xl aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/OG_1200x630_.jpg"
          >
            {videoReady && <source src="/16X9_HomeRenovAi_720P.mp4" type="video/mp4" />}
          </video>
          {/* Badge sobre o vídeo */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-left">
            <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">Watch</p>
            <p className="text-white font-serif text-sm md:text-lg">See the Magic in Action</p>
          </div>
        </div>
      </section>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 md:pt-24 pb-20 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none" />

        <span className="relative z-10 inline-block px-3 md:px-4 py-1.5 mb-6 md:mb-8 text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5 text-center">
          The New Standard of Interior Design
        </span>

        <h1 className="relative z-10 text-5xl md:text-8xl font-serif mb-8 tracking-tight leading-[1.1]">
          Your Dream Home, <br />
          <span className="italic text-[#D4AF37]">Reimagined</span> in Seconds.
        </h1>
        
        <p className="relative z-10 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed mb-12 opacity-80">
          Experience the pinnacle of AI-driven interior design. 
          Transform any room or facade into a masterpiece with professional precision.
        </p>

        <Link 
          href="/workspace" 
          className="relative z-10 px-6 md:px-10 py-4 md:py-5 bg-[#D4AF37] text-black font-bold rounded-full transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] hover:scale-105 uppercase text-[9px] md:text-[10px] tracking-[0.2em] mb-12 md:mb-24 text-center max-w-[90vw]"
        >
          {isLoggedIn 
            ? "Start Your Transformation" 
            : "Start Your Transformation — 3 Free Credits"}
        </Link>

        {/* Imagem Principal Divina (Luxury) */}
        {/* Ajuste: aspect-[4/5] no mobile para ficar alta, aspect-video no desktop */}
        <div className="relative w-full max-w-6xl aspect-[4/5] md:aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
           <Image 
             src="/hero-luxury.jpg" 
             alt="Luxury AI Interior Design" 
             fill
             sizes="(max-width: 768px) 100vw, 1200px"
             priority
             className="object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-left">
             <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">Style</p>
             <p className="text-white font-serif text-lg">Super Luxury</p>
           </div>
        </div>
      </section>

      {/* --- INSPIRATION GRID (As outras 3 imagens) --- */}
      <section className="py-12 md:py-24 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37] mb-3">Unlimited Possibilities</p>
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-white">Explore Breathtaking Aesthetics</h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl overflow-hidden border border-white/5 group bg-zinc-900">
              {/* Ajuste: aspect-video no mobile para ficar deitada, aspect-[4/5] no desktop */}
              <div className="aspect-square md:aspect-[4/5] relative">
                <Image src="/showcase-scandinavian.jpg" alt="Scandinavian style" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="font-serif text-xl text-white">Scandinavian</p>
                <p className="text-sm text-zinc-400 font-light">Serene, bright, and minimalist Nordic spaces.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/5 group bg-zinc-900">
              <div className="aspect-square md:aspect-[4/5] relative">
                <Image src="/showcase-modern.jpg" alt="Modern style" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="font-serif text-xl text-white">Modern Designer</p>
                <p className="text-sm text-zinc-400 font-light">Sleek lines, integrated lighting, high-end materials.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/5 group bg-zinc-900">
              <div className="aspect-square md:aspect-[4/5] relative">
                <Image src="/showcase-industrial.jpg" alt="Industrial style" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="font-serif text-xl text-white">Luxury Industrial</p>
                <p className="text-sm text-zinc-400 font-light">Raw textures, moody lighting, sophisticated loft aesthetic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLES --- */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-zinc-600 text-xs tracking-widest uppercase">
        © 2026 HomeRenovAi. The pinnacle of AI design.
      </footer>

    </main>
  );
}