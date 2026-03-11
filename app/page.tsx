"use client";

import Link from "next/link";
import { useTheme } from "./components/ThemeProvider";
import clsx from "clsx";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className={clsx(
      "min-h-screen transition-colors duration-500 font-sans", 
      isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F4F4F5] text-zinc-900"
    )}>
      
      {/* HEADER DA VITRINE */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter font-serif">
            <span className={isDark ? "text-[#D4AF37]" : "text-zinc-900"}>Home</span>
            <span className="text-blue-500">RenovAi</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Botão de Troca de Tema - Igual ao Workspace */}
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
          Transform any vision into a breathtaking reality with professional precision.
        </p>

        <Link 
          href="/workspace" 
          className="px-10 py-5 bg-[#D4AF37] text-black font-bold rounded-full transition-all duration-300 shadow-xl hover:scale-105 uppercase text-[10px] tracking-[0.2em]"
        >
          Start Your Transformation — 3 Free Credits
        </Link>

        {/* Espaço para a sua Imagem Divina (Text-to-image) */}
        <div className="mt-20 w-full max-w-5xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 flex items-center justify-center">
           <p className="text-zinc-600 italic">Insert your breathtaking AI render here</p>
        </div>
      </section>

    </main>
  );
}