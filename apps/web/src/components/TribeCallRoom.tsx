"use client";

import React, { useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, useTracks, useIsSpeaking } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";

interface TribeCallRoomProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
}

export default function TribeCallRoom({ token, serverUrl, onLeave }: TribeCallRoomProps) {
  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      connectOptions={{ autoSubscribe: true }}
      onDisconnected={onLeave}
      className="flex flex-col h-full bg-[#0b132b] text-slate-100 rounded-3xl overflow-hidden border border-slate-800"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#1c2541]/40">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-bold tracking-tight text-lg">Sessão de Acolhimento Coletivo</h2>
        </div>
        <button
          onClick={onLeave}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-500/10"
        >
          <PhoneOff className="w-4 h-4" />
          Sair da Chamada
        </button>
      </div>

      {/* Grid Adaptativo de Participantes */}
      <div className="flex-1 p-6 overflow-y-auto">
        <TribeVideoGrid />
      </div>

      {/* Renderizador de Áudio Global (Obrigatório para reprodução) */}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function TribeVideoGrid() {
  // Coleta as mídias de vídeo e microfones dos participantes
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full auto-rows-fr">
      {tracks.map((trackReference) => (
        <ParticipantCard
          key={`${trackReference.participant.sid}_${trackReference.source}`}
          trackReference={trackReference}
        />
      ))}
    </div>
  );
}

function ParticipantCard({ trackReference }: { trackReference: any }) {
  const { participant } = trackReference;
  const isSpeaking = useIsSpeaking(participant);
  const [isMuted, setIsMuted] = useState(!participant.isMicrophoneEnabled);

  return (
    <div
      className={`relative rounded-2xl bg-[#1c2541] p-6 flex flex-col items-center justify-center transition-all border-2 ${
        isSpeaking ? "border-mint-400 shadow-lg shadow-mint-400/10 scale-[1.02]" : "border-slate-800"
      }`}
    >
      {/* Avatar Fallback para Privacidade */}
      <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-black text-mint-400 shadow-inner mb-4">
        {participant.identity.slice(0, 2).toUpperCase()}
      </div>

      <span className="font-bold text-sm text-white mb-1 truncate max-w-[150px]">
        {participant.name || participant.identity}
      </span>

      <span className="text-xs text-slate-500 font-medium">
        {participant.isLocal ? "Você" : "Membro"}
      </span>

      {/* Indicadores de Estado Locais */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {isMuted ? (
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400"><MicOff className="w-4 h-4" /></div>
        ) : (
          <div className="p-2 rounded-lg bg-mint-400/20 text-mint-400"><Mic className="w-4 h-4" /></div>
        )}
      </div>
    </div>
  );
}
