import React from "react";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32 bg-cream">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-navy)_0%,_transparent_100%)] opacity-5" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-navy/10 bg-cream/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy/80 shadow-sm backdrop-blur-sm">
            <Leaf className="size-3.5 text-mint" />
            Rede Social Slow Tech
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-navy sm:text-6xl lg:text-7xl">
            Bem-vindo a <span className="italic text-navy/90">Aletis.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 max-w-2xl font-sans text-lg text-navy/80 sm:text-xl leading-relaxed">
            Um espaço digital desenhado para a calma. Deixe para trás os algoritmos 
            viciantes e encontre conexões intencionais, onde a empatia tem valor 
            real e a sua privacidade é matematicamente inviolável.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/cadastro"
              className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-navy px-8 py-4 font-bold text-cream transition-all hover:bg-navy/90 hover:shadow-xl hover:shadow-navy/20 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/10" />
              </div>
              <Sparkles className="size-4 text-mint" />
              <span>Entrar no Santuário</span>
            </Link>

            <a
              href="#vibe"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-navy/15 bg-transparent px-8 py-4 font-bold text-navy transition-all hover:border-navy hover:bg-navy/5 cursor-pointer"
            >
              <span>Conhecer a Vibe</span>
              <ArrowRight className="size-4" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 font-sans text-sm font-medium text-navy/60">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-mint" />
              <span>Zero Anúncios</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-navy/20" />
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-mint" />
              <span>Sem Algoritmos Viciantes</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-navy/20" />
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-mint" />
              <span>Dados Criptografados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
