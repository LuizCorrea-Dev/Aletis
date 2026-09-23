import React from "react";
import { Brain, CheckCircle2, Heart, Scale } from "lucide-react";

export function SentinelSection() {
  return (
    <section id="sentinela" className="py-24 bg-cream relative overflow-hidden border-t border-navy/5">
      <div className="mx-auto max-w-7xl px-6">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-start gap-16 mb-16">
          <div className="lg:w-5/12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-navy/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-navy/80">
              <Brain className="size-3.5 text-navy" />
              O Sentinela Socrático: IA Dual-Brain
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy mb-6">
              Guardião invisível e <br />
              <span className="italic text-navy/80">mentor estoico.</span>
            </h2>

            <p className="font-sans text-lg text-navy/70 leading-relaxed">
              Aletis utiliza modelos locais 100% offline rodando uma <code className="text-sm bg-navy/10 px-1 rounded">IA</code> para triagem lógica e outra <code className="text-sm bg-navy/10 px-1 rounded">IA</code> para acolhimento humano. Não é um censor tirânico, mas uma presença respeitosa e garantindo que sua privacidade permaneça intacta.
            </p>
          </div>

          <div className="lg:w-7/12 w-full pt-4">
            <p className="font-sans text-xl text-navy/80 leading-relaxed font-semibold mb-6">
              Toda inteligência passa pelo Filtro de Epicteto:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-cream border border-navy/10 hover:border-navy/20 transition-all hover:-translate-y-1 shadow-sm">
                <div className="p-3 rounded-full bg-navy/5 mb-4">
                  <Scale className="size-6 text-navy" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-semibold text-navy text-lg mb-2">É verdade?</h4>
                <p className="text-sm text-navy/60 font-sans">Baseado em fatos ou generalizações de fúria? Combate a desinformação e fake news.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-cream border border-navy/10 hover:border-navy/20 transition-all hover:-translate-y-1 shadow-sm">
                <div className="p-3 rounded-full bg-navy/5 mb-4">
                  <CheckCircle2 className="size-6 text-navy" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-semibold text-navy text-lg mb-2">É necessário?</h4>
                <p className="text-sm text-navy/60 font-sans">Adiciona valor ou é apenas ruído? Filtra ruídos e conteúdos irrelevantes.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-cream border border-navy/10 hover:border-navy/20 transition-all hover:-translate-y-1 shadow-sm">
                <div className="p-3 rounded-full bg-navy/5 mb-4">
                  <Heart className="size-6 text-navy" strokeWidth={1.5} />
                </div>
                <h4 className="font-display font-semibold text-navy text-lg mb-2">É gentil?</h4>
                <p className="text-sm text-navy/60 font-sans">Foi escrito para construir ou destruir? Evita julgamentos morais e oferece acolhimento. Previne discursos de ódio e toxicidade.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 md:p-10 rounded-3xl bg-navy text-cream flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="size-6 text-mint shrink-0" />
              <h5 className="font-bold text-xl">A Reformulação Socrática</h5>
            </div>
            <p className="text-sm font-sans text-cream/90 leading-relaxed">
              Se você tenta burlar o sistema (ex: enchendo linguiça), o Sentinela nunca ataca seu ego. Ele envia perguntas privadas: <em>"O que te faz pensar assim?"</em> Um convite à expansão mental e aprendizado. A IA de acolhimento oferece palavras de conforto e encorajamento baseadas nas melhores práticas da pessoais.
            </p>
          </div>

          <div className="p-8 md:p-10 rounded-3xl bg-navy text-cream flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="size-6 text-peach shrink-0" />
              <h5 className="font-bold text-peach text-xl">Punição pelo Silêncio (Time-Out)</h5>
            </div>
            <p className="text-sm font-sans text-cream/90 leading-relaxed">
              Abusos graves custam <strong>-50 VIBES</strong>. Ao zerar o saldo, o usuário perde o direito de falar. A reabilitação exige um pedido aberto de justiça restaurativa para receber Orvalho da comunidade.
            </p>
            <p className="text-sm font-sans text-cream/90 leading-relaxed mt-2">
              Se a postagem não passar no filtro, a Sentinela sugere de forma privada que o usuário reflita e reformule suas palavras. Não há censura arbitrária, mas sim um convite à empatia.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
