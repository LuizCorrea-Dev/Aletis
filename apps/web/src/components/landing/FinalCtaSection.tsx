import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="py-32 bg-cream relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--color-navy)_0%,_transparent_100%)] opacity-[0.03]" />
      
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-5xl md:text-7xl font-semibold text-navy mb-8 tracking-tight">
          Reivindique sua <br />
          <span className="italic text-navy/90">paz mental.</span>
        </h2>
        
        <p className="font-sans text-xl text-navy/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Junte-se à revolução Slow Tech. Abandone as métricas de vaidade e os
          algoritmos viciantes. Construa relações que importam em um ambiente
          que respeita o seu tempo e a sua mente.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/cadastro"
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-navy px-10 py-5 font-bold text-cream transition-all hover:bg-navy/90 hover:shadow-xl hover:shadow-navy/20 hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/10" />
            </div>
            <Sparkles className="size-5 text-mint" />
            <span className="text-lg">Criar perfil no Santuário</span>
          </Link>
          
          <Link
            href="/login"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-5 font-bold text-navy transition-all hover:text-navy/70 cursor-pointer"
          >
            <span>Já tenho uma conta</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
