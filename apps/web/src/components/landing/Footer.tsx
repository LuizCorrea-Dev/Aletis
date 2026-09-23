import React from "react";
import { Logo } from "./Logo";
import { Leaf, Lock } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy/20 bg-navy px-6 py-14 text-cream">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-cream/10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/"
              className="cursor-pointer transition hover:opacity-90"
            >
              <Logo showTagline inverted />
            </Link>
            <p className="mt-4 text-sm text-cream/70 max-w-md font-sans">
              Um refúgio digital Slow Tech de acolhimento emocional, economia da empatia e soberania de dados.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a
              href="#ambientes"
              className="text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-mint transition cursor-pointer"
            >
              Ambientes
            </a>
            <a
              href="#vibe"
              className="text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-mint transition cursor-pointer"
            >
              Economia VIBE
            </a>
            <a
              href="#sentinela"
              className="text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-mint transition cursor-pointer"
            >
              Sentinela
            </a>
            <a
              href="#privacidade"
              className="text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-mint transition cursor-pointer"
            >
              Privacidade
            </a>
            <a
              href="#profissionais"
              className="text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-mint transition cursor-pointer"
            >
              Profissionais
            </a>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 p-3 bg-cream/5 rounded-xl border border-cream/10">
            <Lock className="size-4 text-mint" />
            <p className="text-sm font-sans text-cream/90 font-medium">
              <strong className="text-mint">Manifesto de Soberania:</strong> Seus dados pertencem unicamente a você. Nós não os vendemos, não os treinamos em IA e não os monetizamos. Ponto.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-sans text-cream/50">
            <div className="flex items-center gap-2">
              <Leaf className="size-3.5" />
              <span>Construído para a mente humana</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>© {new Date().getFullYear()} Aletis Slow Tech. Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
