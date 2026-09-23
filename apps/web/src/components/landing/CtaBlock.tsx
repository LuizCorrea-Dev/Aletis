import React from "react";
import { ArrowRight, Leaf } from "lucide-react";
import Link from "next/link";

export function CtaBlock() {
  return (
    <section className="px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-sage-900 p-8 sm:p-12 md:p-16 shadow-xl">
          {/* Subtle botanical backdrop */}
          <div className="absolute top-0 right-0 bottom-0 hidden w-1/2 opacity-20 lg:block pointer-events-none">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--color-sage-300)_0%,_transparent_70%)]" />
          </div>

          <div className="relative z-10 max-w-[42ch]">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-cream-200/80 mb-3">
              <Leaf className="size-3.5 text-emerald-300" />
              Junte-se à Rede Slow Tech
            </span>
            <h2 className="mb-6 font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-balance text-cream-50">
              O jardim das conversas espera por você.
            </h2>
            <p className="text-sm md:text-base text-cream-100/80 mb-8 leading-relaxed">
              Crie seu perfil em menos de 1 minuto, receba suas primeiras VIBES e faça parte de um espaço digital onde a empatia precede o algoritmo.
            </p>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-3 rounded-full bg-cream-50 py-3 pr-6 pl-2.5 text-sm font-medium text-sage-900 ring-1 ring-cream-50 shadow-md hover:bg-cream-100 transition-all active:scale-95 cursor-pointer"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-sage-900 text-cream-50">
                <ArrowRight className="size-4 shrink-0" />
              </span>
              <span>Criar meu perfil grátis</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
