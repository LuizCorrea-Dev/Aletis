"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HeartHandshake, PhoneCall, ExternalLink, ShieldAlert, X } from "lucide-react";

export interface CrisisHelpline {
  name: string;
  phone: string;
  available: string;
  website?: string;
}

export interface CrisisData {
  region: string;
  message: string;
  helplines: CrisisHelpline[];
}

interface CrisisEmergencyModalProps {
  crisisData: CrisisData;
  onClose: () => void;
}

export function CrisisEmergencyModal({ crisisData, onClose }: CrisisEmergencyModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1b4b] w-full max-w-lg rounded-3xl border border-rose-500/50 shadow-2xl shadow-rose-950/80 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Banner Superior com Coração Acolhedor */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 animate-pulse">
            <HeartHandshake size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold font-display">Sua Vida Importa Para Nós</h2>
          <p className="text-xs text-rose-100 mt-1 font-medium">Você não precisa carregar essa dor sozinho(a)</p>
        </div>

        {/* Mensagem Acolhedora */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-4 flex gap-3.5 items-start">
            <ShieldAlert size={22} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {crisisData.message}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
              Linhas Gratuitas e Confidenciais ({crisisData.region}):
            </label>

            {crisisData.helplines.map((helpline) => (
              <div
                key={helpline.phone}
                className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    {helpline.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {helpline.available}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {helpline.website && (
                    <a
                      href={helpline.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Acessar chat online"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <a
                    href={`tel:${helpline.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95"
                  >
                    <PhoneCall size={14} />
                    Ligar {helpline.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Fechamento Acolhedor */}
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Entendi, vou buscar apoio
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
