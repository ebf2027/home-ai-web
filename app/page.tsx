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