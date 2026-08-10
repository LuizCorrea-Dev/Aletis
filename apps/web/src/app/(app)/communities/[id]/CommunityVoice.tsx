"use client";

import React, { useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff, Volume2, Users, Loader2 } from "lucide-react";
import { Channel } from "@aletis/domain";

interface CommunityVoiceProps {
  channel: Channel;
}

export default function CommunityVoice({ channel }: CommunityVoiceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsMuted(false);
      setIsVideoOn(false);
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
      }, 800);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background text-slate-100">

      {/* Container Principal da Call */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-850 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">

        {/* Efeito Visual de Ondas Sonoras Pulsantes */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {isConnected && !isMuted ? (
            <>
              <div className="absolute inset-0 bg-mint-500/10 rounded-full animate-ping duration-1000 scale-125"></div>
              <div className="absolute inset-0 bg-mint-500/20 rounded-full animate-pulse duration-700"></div>
            </>
          ) : isConnected && isMuted ? (
            <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse duration-1000"></div>
          ) : (
            <div className="absolute inset-0 bg-slate-800/30 rounded-full"></div>
          )}

          <div className={`w-24 h-24 rounded-full flex items-center justify-center border z-10 transition-colors ${isConnected && !isMuted
              ? "bg-mint-500 border-mint-450 text-slate-900 shadow-[0_0_25px_rgba(80,200,120,0.4)]"
              : isConnected && isMuted
                ? "bg-orange-500 border-orange-455 text-white"
                : "bg-slate-800 border-slate-700 text-slate-450"
            }`}>
            <Volume2 size={40} className={isConnected && !isMuted ? "" : "animate-pulse"} />
          </div>
        </div>

        <h3 className="text-xl font-bold font-display text-white mb-2 leading-tight">
          {channel.name}
        </h3>

        <p className="text-slate-400 text-sm mb-8 leading-normal max-w-xs">
          {isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-mint-500" size={14} /> Conectando ao canal de áudio...
            </span>
          ) : isConnected ? (
            <span className="text-mint-450 font-semibold">Você está conectado à chamada</span>
          ) : (
            "Entre na sala de conversação para interagir por voz em tempo real."
          )}
        </p>

        {/* Participantes Conectados (Mock se conectado) */}
        {isConnected && (
          <div className="w-full bg-slate-950/40 border border-slate-850 rounded-2xl p-4 mb-8 flex flex-col gap-2.5 items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Users size={12} /> Participantes (3)
            </span>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-6 h-6 rounded-lg bg-mint-500/20 text-mint-500 flex items-center justify-center text-[10px] font-bold">Você</div>
                <span className="text-xs font-bold text-slate-200">Você ({isMuted ? "Mutado" : "Falando"})</span>
              </div>
              <div className="flex items-center gap-2.5 px-1 opacity-75">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anya" className="w-6 h-6 rounded-lg" alt="" />
                <span className="text-xs font-bold text-slate-300">Anya</span>
              </div>
              <div className="flex items-center gap-2.5 px-1 opacity-75">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Loid" className="w-6 h-6 rounded-lg" alt="" />
                <span className="text-xs font-bold text-slate-300">Loid</span>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Conexão */}
        <div className="flex gap-4 shrink-0">
          {isConnected && (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${isMuted
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                    : "bg-slate-800 border-slate-750 text-slate-350 hover:bg-slate-750"
                  }`}
                title={isMuted ? "Ativar Microfone" : "Mutar Microfone"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${isVideoOn
                    ? "bg-mint-500/10 border-mint-500/30 text-mint-450"
                    : "bg-slate-800 border-slate-750 text-slate-350 hover:bg-slate-750"
                  }`}
                title={isVideoOn ? "Desligar Câmera" : "Ligar Câmera"}
              >
                {isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </>
          )}

          <button
            onClick={handleConnection}
            disabled={isConnecting}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isConnected
                ? "bg-red-500 hover:bg-red-650 text-white shadow-red-500/10"
                : "bg-mint-500 hover:bg-mint-600 text-slate-900 shadow-mint-500/10"
              }`}
          >
            {isConnected ? (
              <>
                <PhoneOff size={18} />
                <span>Desconectar</span>
              </>
            ) : (
              <>
                <Phone size={18} />
                <span>Conectar Canal</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
