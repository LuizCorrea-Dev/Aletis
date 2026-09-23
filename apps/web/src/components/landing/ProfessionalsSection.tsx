import React from "react";
import { Stethoscope, ArrowRight, Sparkles, HandHeart } from "lucide-react";
import Link from "next/link";

export function ProfessionalsSection() {
  return (
    <section id="profissionais" className="py-24 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="bg-navy rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-mint/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-peach/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-cream">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cream shadow-sm backdrop-blur-sm">
                <Stethoscope className="size-3.5 text-mint" />
                Para Profissionais
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
                Construa autoridade <br />
                <span className="italic text-mint">sem dancinhas.</span>
              </h2>
              
              <p className="font-sans text-lg text-cream/80 leading-relaxed mb-8">
                Aletis é o primeiro ecossistema desenhado para psicólogos,
                psicanalistas e terapeutas. Crie Comunidades, valide conteúdos e ofereça
                suporte terapêutico em um ambiente livre de algoritmos de engajamento raso.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-mint/20">
                    <HandHeart className="size-4 text-mint" />
                  </div>
                  <span className="text-cream/90 font-sans">
                    <strong>Medie Comunidades:</strong> Gerencie grupos de suporte com ferramentas especializadas de voz e texto.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-mint/20">
                    <Sparkles className="size-4 text-mint" />
                  </div>
                  <span className="text-cream/90 font-sans">
                    <strong>Monetização Ética:</strong> Seja recompensado em VIBE pelo impacto gerado na comunidade.
                  </span>
                </li>
              </ul>
              
              <Link
                href="/profissionais"
                className="inline-flex items-center gap-3 rounded-full bg-cream px-8 py-4 font-bold text-navy transition-all hover:bg-mint hover:text-navy cursor-pointer"
              >
                Solicitar Acesso Profissional
                <ArrowRight className="size-4" />
              </Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              {/* UI Mockup for Professionals */}
              <div className="bg-cream p-6 rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-navy/5">
                <div className="flex items-center gap-4 mb-6 border-b border-navy/10 pb-4">
                  <div className="size-16 rounded-full bg-navy/10 flex items-center justify-center">
                    <Stethoscope className="size-8 text-navy" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl text-navy">Dra. Helena</h4>
                    <p className="text-navy/60 font-sans text-sm">Psicóloga Clínica • Mediadora</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-navy/5 p-4 rounded-xl">
                    <span className="font-bold text-navy font-sans">Comunidade da Ansiedade</span>
                    <span className="bg-mint text-navy text-xs font-bold px-2 py-1 rounded-full">Ativa Agora</span>
                  </div>
                  <div className="flex justify-between items-center bg-navy/5 p-4 rounded-xl">
                    <span className="font-bold text-navy font-sans">Saldo de Impacto</span>
                    <span className="font-display font-bold text-navy">1,240 VIBE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
