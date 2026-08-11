"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  Users,
  Loader2,
  Monitor,
  MonitorOff,
  Radio,
  User,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Channel } from "@aletis/domain";
import { getLiveKitTokenAction } from "@/app/actions/livekit-actions";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { UserIdentity, resolveUserAvatar } from "@/components/molecules/UserIdentity";

interface CommunityVoiceProps {
  channel: Channel;
  currentUserProfile?: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  onParticipantsChange?: (participants: any[]) => void;
}

const getAvatarUrl = (participant: any, currentUserProfile?: { id: string; avatarUrl: string } | null) => {
  if (!participant) return currentUserProfile?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=User";

  if (currentUserProfile && (participant.isLocal || participant.identity === currentUserProfile.id) && currentUserProfile.avatarUrl) {
    return currentUserProfile.avatarUrl;
  }

  try {
    if (participant.metadata) {
      const parsed = JSON.parse(participant.metadata);
      if (parsed.avatarUrl) return parsed.avatarUrl;
    }
  } catch {}

  if (currentUserProfile?.avatarUrl) {
    return currentUserProfile.avatarUrl;
  }

  const seed = participant.name || participant.identity || "User";
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};

export default function CommunityVoice({ channel, currentUserProfile, onParticipantsChange }: CommunityVoiceProps) {
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const res = await getLiveKitTokenAction(channel.id);
      if (res.success && res.token && res.wsUrl) {
        setToken(res.token);
        let finalWsUrl = res.wsUrl;
        if (
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          finalWsUrl.includes("localhost")
        ) {
          finalWsUrl = finalWsUrl.replace("localhost", window.location.hostname);
        }
        setWsUrl(finalWsUrl);
      } else {
        setErrorMessage(res.message || "Não foi possível obter o token de áudio/vídeo.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao conectar à sala de conferência.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setToken(null);
    setWsUrl(null);
    onParticipantsChange?.([]);
  };

  if (!token || !wsUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-background text-slate-100">
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-850 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Visual Wave Concept */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-slate-800/30 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center border z-10 transition-colors bg-slate-800 border-slate-700 text-slate-450">
              <Volume2 size={40} className="animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold font-display text-white mb-2 leading-tight">
            {channel.name}
          </h3>

          <p className="text-slate-400 text-sm mb-8 leading-normal max-w-xs">
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-mint-500" size={16} /> Conectando à sala SFU...
              </span>
            ) : (
              "Entre na sala de áudio e vídeo em grupo para interagir em tempo real."
            )}
          </p>

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl w-full text-center">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-mint-500 hover:bg-mint-600 text-slate-900 shadow-mint-500/10 cursor-pointer disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Phone size={18} />
                <span>Conectar Chamada em Grupo</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={wsUrl}
      connect={true}
      onDisconnected={handleDisconnect}
      data-lk-theme="default"
      className="w-full h-full flex flex-col bg-slate-950 overflow-hidden relative"
    >
      <RoomAudioRenderer />
      <CommunityVoiceRoomInner
        channelName={channel.name}
        currentUserProfile={currentUserProfile}
        onDisconnect={handleDisconnect}
        onParticipantsChange={onParticipantsChange}
      />
    </LiveKitRoom>
  );
}

interface CommunityVoiceRoomInnerProps {
  channelName: string;
  currentUserProfile?: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  onDisconnect: () => void;
  onParticipantsChange?: (participants: any[]) => void;
}

function CommunityVoiceRoomInner({
  channelName,
  currentUserProfile,
  onDisconnect,
  onParticipantsChange,
}: CommunityVoiceRoomInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedTrackKey, setExpandedTrackKey] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(false);

  const participants = useParticipants();

  useEffect(() => {
    onParticipantsChange?.(participants);
  }, [participants, onParticipantsChange]);

  useEffect(() => {
    return () => {
      onParticipantsChange?.([]);
    };
  }, [onParticipantsChange]);
  const rawTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Ocultar card de webcam se o membro estiver transmitindo a tela e a câmera dele estiver desligada
  const tracks = useMemo(() => {
    return rawTracks.filter((trackRef) => {
      if (trackRef.source === Track.Source.Camera) {
        const participantSid = trackRef.participant.sid;
        const isScreenSharing = rawTracks.some(
          (t) =>
            t.participant.sid === participantSid &&
            t.source === Track.Source.ScreenShare &&
            t.publication &&
            !t.publication.isMuted &&
            t.publication.track
        );
        const hasCameraVideo =
          trackRef.publication &&
          !trackRef.publication.isMuted &&
          trackRef.publication.track;

        if (isScreenSharing && !hasCameraVideo) {
          return false;
        }
      }
      return true;
    });
  }, [rawTracks]);

  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  // Monitorar alterações do estado de tela cheia do navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = () => {
    localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  };

  // Alternar Tela Cheia (API HTML5 Fullscreen)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error("Erro ao ativar tela cheia:", err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error("Erro ao sair de tela cheia:", err);
        });
      }
    }
  };

  // Tratar duplo clique num card de vídeo para ampliar/restaurar
  const handleTileDoubleClick = (trackKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedTrackKey === trackKey) {
      setExpandedTrackKey(null);
    } else {
      setExpandedTrackKey(trackKey);
    }
  };

  // Encontrar o participante/track expandido, se houver
  const expandedTrackRef = expandedTrackKey
    ? tracks.find(
        (t) => `${t.participant.sid}-${t.source}` === expandedTrackKey
      )
    : null;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-950 select-none"
    >
      {/* Header Superior da Chamada */}
      <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint-500/10 border border-mint-500/20 text-mint-400 text-xs font-semibold">
            <Radio size={12} className="animate-pulse" /> Ao Vivo
          </div>
          <h2 className="font-bold text-white text-base leading-tight font-display">
            {channelName}
          </h2>
          {expandedTrackKey && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
              <Expand size={12} /> Modo Ampliado
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {expandedTrackKey && (
            <button
              onClick={() => setExpandedTrackKey(null)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Voltar ao mosaico normal"
            >
              <Shrink size={13} /> Restaurar Grade
            </button>
          )}

          {/* Botão de Alternar Painel de Participantes (Canto Direito) */}
          <button
            onClick={() => setShowParticipantsList(!showParticipantsList)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showParticipantsList
                ? "bg-mint-500/20 border-mint-500/40 text-mint-400"
                : "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-750"
            }`}
            title={
              showParticipantsList
                ? "Ocultar lista de participantes"
                : "Mostrar lista de participantes"
            }
          >
            <Users size={14} className={showParticipantsList ? "text-mint-400" : "text-mint-500"} />
            <span>{participants.length} Participantes</span>
            {showParticipantsList ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: Palco de Vídeo + Sidebar de Participantes no Canto Direito */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PALCO PRINCIPAL (Modo Expandido vs Mosaico) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {expandedTrackRef ? (
            /* VISÃO AMPLIADA (Duplo clique ativado) */
            <div
              onDoubleClick={() => setExpandedTrackKey(null)}
              className="flex-1 relative p-4 flex flex-col items-center justify-center bg-slate-950 overflow-hidden group cursor-pointer"
              title="Duplo clique para restaurar o tamanho normal"
            >
              {(() => {
                const isSpeaking = expandedTrackRef.participant.isSpeaking;
                const identity = expandedTrackRef.participant.identity;
                const name =
                  expandedTrackRef.participant.name || identity || "Participante";
                const hasVideo =
                  expandedTrackRef.publication &&
                  !expandedTrackRef.publication.isMuted &&
                  expandedTrackRef.publication.track;

                return (
                  <div className="relative w-full h-full max-w-6xl max-h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
                    {hasVideo ? (
                      <VideoTrack
                        trackRef={expandedTrackRef}
                        className="w-full h-full object-contain rounded-3xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 p-8">
                        <div
                          className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border ${
                            isSpeaking
                              ? "border-mint-400 animate-pulse ring-4 ring-mint-500/30"
                              : "border-slate-700"
                          }`}
                        >
                          <img
                            src={getAvatarUrl(expandedTrackRef.participant, currentUserProfile)}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-slate-300 font-medium text-lg">
                          {name}
                        </span>
                      </div>
                    )}

                    {/* Overlay Informativo superior */}
                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                      <Shrink size={14} className="text-mint-400" />
                      <span>Duplo clique na tela para voltar ao normal</span>
                    </div>

                    {/* Overlay Inferior com nome do participante */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-sm font-semibold text-white">
                      <UserIdentity
                        user={{
                          id: expandedTrackRef.participant.identity,
                          name,
                          avatarUrl: getAvatarUrl(expandedTrackRef.participant, currentUserProfile),
                          isSpeaking,
                          isLocal: expandedTrackRef.participant.isLocal,
                          metadata: expandedTrackRef.participant.metadata,
                          subtitle: expandedTrackRef.source === Track.Source.ScreenShare
                            ? "Transmissão de Tela"
                            : isSpeaking
                            ? "Falando..."
                            : "Áudio OK",
                        }}
                        size="xs"
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Mini-mosaico flutuante de outros participantes */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-30 max-h-[70%] overflow-y-auto pr-1">
                {tracks
                  .filter(
                    (t) =>
                      `${t.participant.sid}-${t.source}` !== expandedTrackKey
                  )
                  .map((t) => {
                    const key = `${t.participant.sid}-${t.source}`;
                    const name = t.participant.name || t.participant.identity || "P";
                    const hasVid =
                      t.publication && !t.publication.isMuted && t.publication.track;

                    return (
                      <div
                        key={key}
                        onDoubleClick={(e) => handleTileDoubleClick(key, e)}
                        onClick={() => setExpandedTrackKey(key)}
                        className="w-32 h-20 bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 hover:border-mint-400 transition-all relative flex items-center justify-center group"
                        title={`Clique para alternar para ${name} (duplo clique expande)`}
                      >
                        {hasVid ? (
                          <VideoTrack
                            trackRef={t}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={getAvatarUrl(t.participant, currentUserProfile)} alt={name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 text-[10px] text-white px-1.5 py-0.5 rounded truncate">
                          {name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* VISÃO MOSAICO PADRÃO (Grid) */
            <div
              onDoubleClick={toggleFullscreen}
              className="flex-1 p-4 overflow-y-auto grid gap-4 place-content-center items-center justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr"
            >
              {tracks.map((trackRef) => {
                const trackKey = `${trackRef.participant.sid}-${trackRef.source}`;
                const isSpeaking = trackRef.participant.isSpeaking;
                const identity = trackRef.participant.identity;
                const name =
                  trackRef.participant.name || identity || "Participante";
                const hasVideo =
                  trackRef.publication &&
                  !trackRef.publication.isMuted &&
                  trackRef.publication.track;

                return (
                  <div
                    key={trackKey}
                    onDoubleClick={(e) => handleTileDoubleClick(trackKey, e)}
                    className={`relative aspect-video w-full max-w-md bg-slate-900/90 border rounded-2xl overflow-hidden flex items-center justify-center shadow-xl transition-all cursor-pointer group ${
                      isSpeaking
                        ? "border-mint-500 ring-2 ring-mint-500/50 shadow-[0_0_20px_rgba(80,200,120,0.3)]"
                        : "border-slate-800 hover:border-mint-500/50 hover:shadow-mint-500/10"
                    }`}
                    title="Duplo clique para ampliar na tela total da sala"
                  >
                    {hasVideo ? (
                      <VideoTrack
                        trackRef={trackRef}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 p-4">
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border ${
                            isSpeaking
                              ? "border-mint-400 animate-pulse ring-2 ring-mint-500/40"
                              : "border-slate-700"
                          }`}
                        >
                          <img src={getAvatarUrl(trackRef.participant, currentUserProfile)} alt={name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    {/* Dica de Duplo Clique no Hover */}
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-750 text-mint-400 shadow-md">
                      <Expand size={14} />
                    </div>

                    {/* Overlay do Nome e Indicador de Áudio */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-white">
                      <UserIdentity
                        user={{
                          id: trackRef.participant.identity,
                          name,
                          avatarUrl: getAvatarUrl(trackRef.participant, currentUserProfile),
                          isSpeaking,
                          isLocal: trackRef.participant.isLocal,
                          metadata: trackRef.participant.metadata,
                          subtitle: trackRef.source === Track.Source.ScreenShare
                            ? "Tela"
                            : isSpeaking
                            ? "Falando"
                            : "Silêncio",
                        }}
                        size="xs"
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAINEL LATERAL NO CANTO DIREITO: Lista de Participantes da Call */}
        {showParticipantsList && (
          <div className="w-72 bg-slate-900/95 border-l border-slate-800 flex flex-col shrink-0 z-20 backdrop-blur-md animate-in slide-in-from-right duration-200">
            {/* Header do Painel */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white font-display">
                <Users size={16} className="text-mint-400" />
                <span>Membros da Call ({participants.length})</span>
              </div>
              <button
                onClick={() => setShowParticipantsList(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Ocultar participantes"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista de Membros Ativos */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {participants.map((p) => {
                const name = p.name || p.identity || "Participante";
                const isSpeaking = p.isSpeaking;
                const isMicOn = p.isMicrophoneEnabled;
                const isCamOn = p.isCameraEnabled;
                const isScreenOn = p.isScreenShareEnabled;

                return (
                  <div
                    key={p.sid}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isSpeaking
                        ? "bg-mint-500/10 border-mint-500/30"
                        : "bg-slate-850/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <UserIdentity
                      user={{
                        id: p.identity,
                        name,
                        avatarUrl: getAvatarUrl(p, currentUserProfile),
                        isSpeaking,
                        isMicOn,
                        isCamOn,
                        isScreenOn,
                        isLocal: p.isLocal,
                        metadata: p.metadata,
                        subtitle: isSpeaking ? "Falando..." : "Na sala",
                      }}
                      size="sm"
                      showStatusIcons={true}
                      className="flex-1"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar Inferior Estilo Discord com Botão de Tela Cheia e Participantes */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-3 z-20 shrink-0 backdrop-blur-md">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isMicrophoneEnabled
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
              : "bg-orange-500/20 border-orange-500/40 text-orange-400"
          }`}
          title={isMicrophoneEnabled ? "Mutar Microfone" : "Ativar Microfone"}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isCameraEnabled
              ? "bg-mint-500/20 border-mint-500/40 text-mint-400 hover:bg-mint-500/30"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
          }`}
          title={isCameraEnabled ? "Desligar Câmera" : "Ligar Câmera"}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isScreenShareEnabled
              ? "bg-mint-500 border-mint-400 text-slate-900"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
          }`}
          title={
            isScreenShareEnabled
              ? "Parar Compartilhamento de Tela"
              : "Compartilhar Tela"
          }
        >
          {isScreenShareEnabled ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>

        {/* Botão de Lista de Participantes (Toggle) */}
        <button
          onClick={() => setShowParticipantsList(!showParticipantsList)}
          className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer relative ${
            showParticipantsList
              ? "bg-mint-500/20 border-mint-500/40 text-mint-400"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
          }`}
          title={
            showParticipantsList
              ? "Ocultar Painel de Participantes"
              : "Mostrar Painel de Participantes"
          }
        >
          <Users size={20} />
          {participants.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-mint-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {participants.length}
            </span>
          )}
        </button>

        {/* Botão de Tela Cheia (Fullscreen) */}
        <button
          onClick={toggleFullscreen}
          className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isFullscreen
              ? "bg-mint-500/20 border-mint-500/40 text-mint-400"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
          }`}
          title={
            isFullscreen
              ? "Sair da Tela Cheia do Navegador"
              : "Colocar em Tela Cheia no Navegador"
          }
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        <button
          onClick={onDisconnect}
          className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20 cursor-pointer ml-3"
          title="Desconectar da Chamada"
        >
          <PhoneOff size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
