"use client";

import React, { useState, useEffect } from "react";
import { Coins, Heart, Handshake, ArrowUpRight } from "lucide-react";

export function VibeEconomySection() {
  const [vibeCount, setVibeCount] = useState(0);
  const [balance, setBalance] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateVibe = () => {
    if (balance <= 0) return;
    setVibeCount((prev) => prev + 1);
    setBalance((prev) => prev - 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <section id="vibe" className="py-24 bg-navy text-cream relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-full max-w-2xl opacity-20 blur-3xl pointer-events-none">
        <div className="aspect-square bg-gradient-to-bl from-mint to-transparent rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-mint">
              <Coins className="size-3.5" />
              Economia da Atenção Positiva
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              Onde a empatia é a <br />
              <span className="text-mint italic">única moeda.</span>
            </h2>
            
            <p className="font-sans text-lg text-cream/70 mb-8 leading-relaxed">
              Diferente de outras redes onde "curtir" não custa nada, na Aletis a validação é um recurso valioso. A VIBE opera em uma economia de <strong className="text-cream">Soma Zero Ajustada</strong>: para apoiar alguém, você transfere do seu próprio saldo, provando que sua empatia é real e intencional.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 bg-mint/20 p-2 rounded-full h-fit">
                  <Heart className="size-5 text-mint" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">O Custo do Apoio</h4>
                  <p className="text-cream/60 text-sm">Curtir um desabafo transfere 1 VIBE seu para o autor. Comentar profundamente custa 2 VIBEs. Quem recebe sabe do seu esforço.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-mint/20 p-2 rounded-full h-fit">
                  <Handshake className="size-5 text-mint" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">O Orvalho Diário</h4>
                  <p className="text-cream/60 text-sm">Ao entrar, você recebe 6 VIBEs diários (Orvalho) que expiram em 24h. Isso te incentiva a não guardar, mas distribuir apoio todos os dias.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Interactive Simulator */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-mint/20 to-transparent rounded-3xl transform rotate-3 scale-105" />
            
            <div className="relative bg-cream rounded-3xl p-8 md:p-12 shadow-2xl border border-navy/5 text-navy text-center flex flex-col items-center">
              <h3 className="font-display text-2xl font-bold mb-2">Simulador VIBE</h3>
              <p className="text-navy/60 text-sm mb-10">Experimente o poder da empatia.</p>
              
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-mint rounded-full blur-xl opacity-20" />
                <div className="relative flex items-center justify-center size-48 rounded-full border-4 border-mint/20 bg-white shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className={`font-display text-6xl font-bold text-navy transition-transform duration-300 ${isAnimating ? 'scale-125 text-mint' : ''}`}>
                      {vibeCount}
                    </span>
                    <span className="font-bold text-mint uppercase tracking-widest text-xs mt-2">VIBE Enviado</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 flex items-center justify-between w-full px-4 py-3 bg-navy/5 rounded-lg text-sm font-bold text-navy">
                <span>Seu Saldo:</span>
                <span className="flex items-center gap-1 font-sans"><Coins className="size-4 text-mint"/> {balance} VIBE</span>
              </div>
              
              <button
                onClick={generateVibe}
                disabled={balance <= 0}
                className="group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-navy text-cream font-bold transition-all hover:bg-navy/90 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Heart className="size-5 text-mint group-hover:scale-110 transition-transform" />
                Oferecer Apoio
                <ArrowUpRight className="size-4 opacity-50" />
              </button>
              
              <p className="mt-4 text-xs text-navy/40">
                Cada clique simula uma interação positiva na rede.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
