import React from "react";
import { Users, Feather, Home } from "lucide-react";

const environments = [
  {
    title: "O Feed Principal",
    description:
      "Focado no desabafo cru. Funciona em ordem cronológica reversa, sem algoritmos predatórios. Um porto seguro para expor tristezas e pedidos de ajuda sem julgamento social.",
    icon: Home,
    accentColor: "bg-navy/5",
    iconColor: "text-navy",
  },
  {
    title: "Átrio da Leveza",
    description:
      "Um contrapeso neurobiológico. Destinado ao humor, arte e momentos de esperança. Serve como um respiro emocional para que o cérebro processe e se recupere do peso do mundo real.",
    icon: Feather,
    accentColor: "bg-peach/20",
    iconColor: "text-peach",
  },
  {
    title: "Comunidades",
    description:
      "Espaços temáticos de nichos de sentimentos idênticos. Promove Terapia Coletiva Orgânica com feeds e canais de texto para apoio mútuo, eliminando o isolamento.",
    icon: Users,
    accentColor: "bg-mint/20",
    iconColor: "text-mint",
  },
];

export function EnvironmentsSection() {
  return (
    <section id="ambientes" className="py-24 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy mb-6 tracking-tight">
            Os Três Ambientes: <br />
            <span className="italic text-navy/80">Organizando a Carga Emocional</span>
          </h2>
          <p className="font-sans text-lg text-navy/70 leading-relaxed">
            Para proteger a integridade mental da comunidade e evitar uma espiral de exaustão, a Aletis organiza suas interações em três espaços. Cada espaço foi intencionalmente arquitetado para preservar sua energia, não para drená-la.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {environments.map((env, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start p-8 rounded-3xl bg-cream border border-navy/10 hover:border-navy/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/5"
            >
              <div className={`p-4 rounded-2xl ${env.accentColor} mb-6 transition-transform group-hover:scale-110`}>
                <env.icon className={`size-8 ${env.iconColor}`} strokeWidth={1.5} />
              </div>

              <h3 className="font-display text-2xl font-semibold text-navy mb-4">
                {env.title}
              </h3>

              <p className="font-sans text-navy/70 leading-relaxed text-sm">
                {env.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
