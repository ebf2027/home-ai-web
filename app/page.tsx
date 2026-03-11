"use client";

import Link from "next/link";
import { useTheme } from "./components/ThemeProvider"; // Ajuste o caminho se necessário
import clsx from "clsx";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className={clsx("min-h-screen transition-colors duration-500", isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F4F4F5] text-zinc-900")}>
      
      {/* HEADER DA VITRINE */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter font-serif">
            <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
            <span className="text-blue-500">RenovAi</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Botão de Troca de Tema - Estilo Premium */}
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
          
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors">
            Login
          </Link>
        </div>
      </header>

      {/* --- CONTEÚDO DA HERO --- */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center">
        {/* Título com a Fonte Playfair Display (font-serif) */}
        <h1 className="text-5xl md:text-8xl font-serif mb-8 tracking-tight leading-[1.1]">
          Your Dream Home, <br />
          <span className="italic text-[#D4AF37]">Reimagined</span> in Seconds.
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed mb-12 opacity-80">
          Experience the pinnacle of AI-driven interior design. 
          Transform any vision into a breathtaking reality.
        </p>

        <Link 
          href="/workspace" 
          className="px-10 py-5 bg-[#D4AF37] text-black font-bold rounded-full transition-all duration-300 shadow-xl hover:scale-105 uppercase text-xs tracking-widest"
        >
          Get Started — 3 Free Designs
        </Link>
      </section>

    </main>
  );
}

import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-[#0A0A0A]">
      {/* Efeito de luz ambiente sutil no fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge de Lançamento */}
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
          The Future of Interior Design
        </span>

        {/* Título Principal - O impacto visual */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 tracking-tight leading-[1.1]">
          Your Dream Home, <br />
          <span className="italic text-[#D4AF37]">Reimagined</span> in Seconds.
        </h1>

        {/* Subtítulo */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12">
          Professional-grade AI visualization for high-end properties. 
          Transform any space into a masterpiece with unmatched realism.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <button className="px-10 py-4 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold rounded-full transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.5)] transform hover:-translate-y-1">
            Start Your Transformation
          </button>
          <button className="text-white font-medium hover:text-[#D4AF37] transition-colors flex items-center gap-2">
            View Gallery <span className="text-lg">→</span>
          </button>
        </div>

        {/* Placeholder para o seu componente de Before/After Slider */}
        <div className="relative group max-w-5xl mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <div className="aspect-video bg-zinc-900 flex items-center justify-center text-zinc-700 italic">
             {/* Aqui você insere o seu componente <BeforeAfterSlider /> real */}
             [ O seu Slider Before/After de Luxo entra aqui ]
          </div>
          
          {/* Legenda flutuante */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/10 text-left">
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-1">Style</p>
              <p className="text-white font-serif text-lg">Modern Scandinavian</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}