import React from "react";
import { Shield, Handshake, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AllianceSection() {
  return (
    <section id="alianca" className="px-6 py-24 bg-sage-900 text-cream-50 relative overflow-hidden">
      {/* Decorative botanical overlay */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 size-96 bg-emerald-400 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 size-96 bg-sage-400 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-800 border border-sage-700 text-cream-100 text-xs font-semibold tracking-widest uppercase mb-6">
            <Shield className="size-3.5 text-emerald-400" />
            Aliança Ética & Clínica
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
            O Espaço do Profissional de Saúde
          </h2>
          <p className="text-sage-300 text-lg leading-relaxed">
            Conecte sua prática clínica a um ecossistema <strong className="text-cream-50 font-medium">Slow Tech</strong> transparente. Financie a independência da plataforma enquanto oferece escuta qualificada a quem mais precisa.
          </p>
        </div>

        {/* Três Pilares da Assinatura Profissional */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* 1. Para Quem É */}
          <div className="p-8 rounded-[32px] bg-sage-800/50 border border-sage-700/50 hover:border-sage-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="size-14 bg-sage-900 rounded-2xl flex items-center justify-center text-sage-300 mb-6 group-hover:text-emerald-300 group-hover:-translate-y-1 transition-all shadow-inner">
                <Users className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Para Quem É?</h3>
              <p className="text-sage-400 text-sm leading-relaxed mb-6">
                Desenhado exclusivamente para psicólogos, terapeutas, psiquiatras e profissionais de acolhimento humano.
              </p>
            </div>
            <ul className="space-y-3 pt-6 border-t border-sage-700/50 text-xs font-medium text-sage-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Profissionais com registro ou certificação</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Terapeutas de abordagens integrativas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Facilitadores de grupos de apoio</span>
              </li>
            </ul>
          </div>

          {/* 2. O Porquê / Propósito */}
          <div className="p-8 rounded-[32px] bg-sage-800 border-2 border-emerald-500/30 shadow-xl shadow-emerald-900/20 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
            
            <div>
              <div className="size-14 bg-sage-900 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Handshake className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Propósito Maior</h3>
              <p className="text-sage-300 text-sm leading-relaxed mb-6">
                Sua assinatura financia o ecossistema livre de anúncios, sustentando a soberania de dados e garantindo um refúgio seguro.
              </p>
            </div>
            <ul className="space-y-3 pt-6 border-t border-sage-700 text-xs font-medium text-cream-100">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sustentar a rede Slow Tech para todos</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Presença de autoridade ética e acolhedora</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mentoria ativa e cura coletiva orgânica</span>
              </li>
            </ul>
          </div>

          {/* 3. Vantagens & Funcionalidades */}
          <div className="p-8 rounded-[32px] bg-sage-800/50 border border-sage-700/50 hover:border-sage-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="size-14 bg-sage-900 rounded-2xl flex items-center justify-center text-sage-300 mb-6 group-hover:text-emerald-300 group-hover:-translate-y-1 transition-all shadow-inner">
                <Zap className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Ferramentas</h3>
              <p className="text-sage-400 text-sm leading-relaxed mb-6">
                Recursos exclusivos para exercer o acolhimento com visibilidade diferenciada e métricas puramente éticas.
              </p>
            </div>
            <ul className="space-y-3 pt-6 border-t border-sage-700/50 text-xs font-medium text-sage-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Visibilidade Peso 3</strong> em respostas de apoio</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Selo Clínico</strong> verificado no perfil</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mediação de salas de áudio nas Comunidades</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Banner CTA para Profissionais */}
        <div className="p-10 lg:p-12 rounded-[32px] bg-sage-800 border border-sage-700 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Faça parte da rede de acolhimento profissional
            </h3>
            <p className="text-sage-400 text-sm leading-relaxed mb-8 max-w-lg">
              Inscreva-se como parceiro clínico, passe pela nossa verificação ética e ative suas credenciais no Aletis.
            </p>
            
            <Link
              href="/billing"
              className="group inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-sm font-semibold text-sage-900 transition-all hover:bg-cream-100 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Conhecer Painel Profissional</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
