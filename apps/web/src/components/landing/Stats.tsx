import React from "react";
import { Users, Heart, ShieldAlert } from "lucide-react";

export function Stats() {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-sage-900/10 bg-cream-100/60 p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:items-center">
            {/* Stat 1 */}
            <div className="text-center md:text-left border-b border-sage-900/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Users className="size-5 text-sage-600" />
                <p className="font-display text-4xl lg:text-5xl font-medium text-sage-900">
                  12k+
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">
                Membros Ativos
              </p>
              <p className="text-[11px] text-sage-500 mt-1">
                Conexões orgânicas e reais
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center md:text-left border-b border-sage-900/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Heart className="size-5 text-sage-600" />
                <p className="font-display text-4xl lg:text-5xl font-medium text-sage-900">
                  4.9/5
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">
                Nível de Acolhimento
              </p>
              <p className="text-[11px] text-sage-500 mt-1">
                Avaliado pela própria comunidade
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center md:text-left border-b border-sage-900/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <ShieldAlert className="size-5 text-sage-600" />
                <p className="font-display text-4xl lg:text-5xl font-medium text-sage-900">
                  0
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">
                Ads ou Rastreio
              </p>
              <p className="text-[11px] text-sage-500 mt-1">
                Soberania e respeito a seus dados
              </p>
            </div>

            {/* Ethos Paragraph */}
            <div className="text-center md:text-left pl-0 md:pl-2">
              <p className="font-display text-base font-medium text-sage-900">
                Qualidade sobre Volume
              </p>
              <p className="text-xs text-sage-700 mt-1.5 leading-relaxed">
                Uma comunidade que cresce organicamente, valorizando a profundidade de cada palavra em vez da velocidade do feed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
