import React from "react";
import { Lock, HeartHandshake, ShieldCheck, Key } from "lucide-react";

export function PrivacySection() {
  return (
    <section id="privacidade" className="py-24 bg-navy text-cream relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-40 top-20 -z-10 w-96 h-96 bg-mint/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-40 bottom-20 -z-10 w-96 h-96 bg-peach/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-mint">
            <Lock className="size-3.5" />
            Privacidade Inviolável
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
            O que é seu, <br className="md:hidden" />
            <span className="italic text-mint">é apenas seu.</span>
          </h2>
          <p className="font-sans text-lg text-cream/70 leading-relaxed">
            Na Aletis, não existe meio-termo quando se trata de privacidade.
            Seus pensamentos mais íntimos estão protegidos por criptografia de ponta a ponta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Cofre de Memórias */}
          <div className="flex flex-col p-8 sm:p-10 rounded-3xl bg-cream/5 border border-cream/10 backdrop-blur-sm relative overflow-hidden group hover:border-mint/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Key className="size-24 text-mint" />
            </div>
            
            <div className="p-3 rounded-2xl bg-mint/20 w-fit mb-6">
              <ShieldCheck className="size-6 text-mint" />
            </div>
            
            <h3 className="font-display text-2xl font-bold mb-4">Cofre de Memórias</h3>
            <p className="font-sans text-cream/70 leading-relaxed mb-6">
              Seu diário digital completamente criptografado. Um espaço sagrado
              para você refletir sem medo de vazamentos, rastreadores de anúncios
              ou IA lendo seus pensamentos. 
            </p>
            <ul className="space-y-3 font-sans text-sm text-cream/80 mt-auto">
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-mint" />
                Apenas você tem a chave de acesso.
              </li>
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-mint" />
                Zero coleta de dados comportamentais.
              </li>
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-mint" />
                Livre de notificações intrusivas.
              </li>
            </ul>
          </div>

          {/* Vínculo de Anjo */}
          <div className="flex flex-col p-8 sm:p-10 rounded-3xl bg-cream/5 border border-cream/10 backdrop-blur-sm relative overflow-hidden group hover:border-peach/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <HeartHandshake className="size-24 text-peach" />
            </div>
            
            <div className="p-3 rounded-2xl bg-peach/20 w-fit mb-6">
              <HeartHandshake className="size-6 text-peach" />
            </div>
            
            <h3 className="font-display text-2xl font-bold mb-4">Vínculo de Anjo</h3>
            <p className="font-sans text-cream/70 leading-relaxed mb-6">
              O design focado em saúde mental inclui o botão de Vínculo de Anjo.
              Em momentos de crise, com um único toque, pessoas de confiança pré-selecionadas
              ou profissionais são alertados imediatamente.
            </p>
            <ul className="space-y-3 font-sans text-sm text-cream/80 mt-auto">
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-peach" />
                Acionamento silencioso e imediato.
              </li>
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-peach" />
                Compartilhamento temporário de localização (opcional).
              </li>
              <li className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-peach" />
                Redirecionamento para linhas de apoio.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
