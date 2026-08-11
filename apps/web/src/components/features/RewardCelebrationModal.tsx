"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Check, ShieldCheck } from "lucide-react";
import { VibeCelebration } from "@/components/ui/VibeCelebration";

export interface RewardBreakdown {
  total: number;
  orvalho: number;
  post: number;
  media: number;
}

export interface RewardData {
  success: boolean;
  newBalance: number;
  message: string;
  breakdown?: RewardBreakdown;
}

interface RewardCelebrationModalProps {
  reward: RewardData | null;
  onClose: () => void;
}

export const RewardCelebrationModal: React.FC<RewardCelebrationModalProps> = ({ reward, onClose }) => {
  const [triggerParticles, setTriggerParticles] = useState(false);

  useEffect(() => {
    if (reward) {
      setTriggerParticles(true);
    }
  }, [reward]);

  if (!reward) return null;

  const breakdown = reward.breakdown || { total: 1, orvalho: 0, post: 1, media: 0 };
  const hasOrvalho = breakdown.orvalho > 0;

  return (
    <>
      {/* Efeito Visual de Partículas VibeCelebration */}
      <VibeCelebration trigger={triggerParticles} onComplete={() => setTriggerParticles(false)} />

      <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#0f172a] border border-cyan-500/40 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden text-center animate-in zoom-in-95 duration-300">
          
          {/* Efeitos de Luz no Fundo */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#50c878]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Ícone Principal em Destaque */}
          <div className="relative mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-bounce">
            {hasOrvalho ? (
              <span className="text-4xl">💧</span>
            ) : (
              <Zap className="text-[#FFC300]" size={36} fill="#FFC300" />
            )}
            <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-lg">
              <Sparkles size={14} />
            </div>
          </div>

          {/* Título e Descrição */}
          <h3 className="text-2xl font-black text-white font-display tracking-tight mb-2">
            {hasOrvalho ? (
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-[#50c878] bg-clip-text text-transparent">
                Orvalho do Dia Concedido!
              </span>
            ) : (
              <span className="text-white">Recompensa de Vibes!</span>
            )}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
            {hasOrvalho
              ? "Sua primeira publicação do dia despertou a renovação da sua alma. Aproveite o seu Orvalho temporário por 24 horas!"
              : "Sua contribuição foi ouvida e abençoada pela comunidade Aletis."}
          </p>

          {/* Detalhamento de Recompensas */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 mb-6 space-y-3 text-left">
            {hasOrvalho && (
              <div className="flex items-center justify-between p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">💧</span>
                  <div>
                    <p className="text-xs font-bold text-cyan-200">Orvalho do Dia (24h)</p>
                    <p className="text-[10px] text-cyan-400/80">Vibes temporárias para doar ou usar</p>
                  </div>
                </div>
                <span className="text-sm font-black text-cyan-300 bg-cyan-900/80 px-2.5 py-1 rounded-lg border border-cyan-400/40">
                  +{breakdown.orvalho} VIBES
                </span>
              </div>
            )}

            {breakdown.post > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <Zap size={16} className="text-[#FFC300]" fill="#FFC300" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Recompensa de Post</p>
                    <p className="text-[10px] text-slate-400">Saldo permanente</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#FFC300] bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  +{breakdown.post} VIBE
                </span>
              </div>
            )}

            {breakdown.media > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[#50c878]" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Bônus de Mídia Anexada</p>
                    <p className="text-[10px] text-slate-400">Foto / Vídeo / Documento</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#50c878] bg-[#50c878]/10 px-2.5 py-1 rounded-lg border border-[#50c878]/30">
                  +{breakdown.media} VIBE
                </span>
              </div>
            )}
          </div>

          {/* Saldo Total Acumulado */}
          <div className="flex items-center justify-between mb-6 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
            <span className="text-xs font-bold text-slate-400">Novo Saldo Total</span>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#FFC300]" fill="#FFC300" />
              <span className="text-base font-black text-[#FFC300]">{reward.newBalance} VIBES</span>
            </div>
          </div>

          {/* Botão de Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-[#50c878] to-cyan-500 text-[#0f172a] font-extrabold text-sm rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={3} />
            Continuar no Aletis
          </button>

        </div>
      </div>
    </>
  );
};
