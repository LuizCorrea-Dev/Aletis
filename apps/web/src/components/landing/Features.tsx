import React from "react";
import { Sparkles, Zap, Shield, Users, Compass } from "lucide-react";
import Link from "next/link";

export function Features() {
  const features = [
    {
      id: "santuario",
      title: "O Santuário",
      description:
        "Um feed cronológico sem curtidas tóxicas ou métricas de vaidade. Apenas desabafos crus aguardando acolhimento. A privacidade é absoluta.",
      icon: <Sparkles className="size-6 text-sage-600" />,
      color: "bg-sage-100",
      borderColor: "border-sage-200",
    },
    {
      id: "atrio",
      title: "Átrio da Leveza",
      description:
        "Um contrapeso de humor e inspiração. Memes gentis, arte e pequenos respiros emocionais para equilibrar os dias difíceis.",
      icon: <Compass className="size-6 text-sage-600" />,
      color: "bg-cream-100",
      borderColor: "border-cream-200",
    },
    {
      id: "comunidades",
      title: "Comunidades & Chamadas",
      description:
        "Comunidades seguras para interesses em comum. Salas de texto e voz onde a cura acontece no coletivo.",
      icon: <Users className="size-6 text-sage-600" />,
      color: "bg-sage-100",
      borderColor: "border-sage-200",
    },
    {
      id: "economia",
      title: "Economia da Empatia",
      description:
        "Apoiar alguém custa 'VIBES'. A energia é limitada (Soma Zero Ajustada), garantindo que cada incentivo seja intencional e profundamente real.",
      icon: <Zap className="size-6 text-sage-600" />,
      color: "bg-cream-100",
      borderColor: "border-cream-200",
    },
  ];

  return (
    <section id="recursos" className="px-6 py-24 bg-cream-50 relative">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl">
            Desenhado para o ser humano.
          </h2>
          <p className="mt-4 text-sage-600">
            Diferente das redes tradicionais, o Aletis não otimiza para retenção. Nós otimizamos para o acolhimento, a catarse e o alívio.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <div
              key={feature.id}
              className={`group relative overflow-hidden rounded-3xl border ${feature.borderColor} ${feature.color} p-8 sm:p-10 transition-all hover:shadow-lg`}
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-white/40 opacity-0 transition-opacity group-hover:opacity-100 blur-2xl" />
              
              <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/60 shadow-sm backdrop-blur-sm">
                {feature.icon}
              </div>
              
              <h3 className="mb-3 font-display text-xl font-bold text-sage-900">
                {feature.title}
              </h3>
              
              <p className="text-sage-700 leading-relaxed max-w-[40ch]">
                {feature.description}
              </p>

              {/* Decorative graphic hinting at the feature */}
              <div className="mt-8 pt-6 border-t border-sage-900/5">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sage-800 transition-colors hover:text-sage-950 cursor-pointer"
                >
                  Explorar {feature.title.toLowerCase()}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
