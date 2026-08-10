"use client";

import React, { useState } from "react";
import { X, Hash, Volume2, Lock, Loader2, MessageSquare } from "lucide-react";
import { ChannelType, Channel } from "@aletis/domain";
import { createChannelAction } from "@/app/actions/community-actions";

interface CreateChannelModalProps {
  communityId: string;
  initialType?: ChannelType;
  onClose: () => void;
  onCreated: (newChannel: Channel) => void;
}

export default function CreateChannelModal({
  communityId,
  initialType = "CHAT",
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const [channelType, setChannelType] = useState<ChannelType>(initialType);
  const [name, setName] = useState("");
  const [accessLevel, setAccessLevel] = useState<"PUBLIC" | "PRIVATE" | "STAFF_ONLY">("PUBLIC");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formata o nome no estilo Discord (letras minúsculas e hífens em vez de espaços)
    const formatted = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    setName(formatted);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome do canal é obrigatório.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await createChannelAction({
        communityId,
        name: name.trim(),
        type: channelType,
        isPrivate: accessLevel !== "PUBLIC",
        isAnnouncements: channelType === "FEED",
        accessLevel,
      });

      if (res.success && res.data) {
        onCreated(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || "Erro ao criar canal.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao criar canal. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/60 bg-slate-800/40">
          <div>
            <h2 className="font-extrabold text-white text-lg font-display tracking-tight">
              Criar Canal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adicione um novo espaço para conversas na sua comunidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Tipo de Canal */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tipo de Canal
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Opção Canal de Texto */}
              <div
                onClick={() => setChannelType("CHAT")}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${channelType === "CHAT"
                    ? "bg-mint-500/10 border-mint-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${channelType === "CHAT"
                      ? "bg-mint-500 text-slate-900"
                      : "bg-slate-800 text-slate-400"
                    }`}
                >
                  <Hash size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Texto</p>
                  <p className="text-[11px] text-slate-400">
                    Poste mensagens, conversas, imagens e memes
                  </p>
                </div>
              </div>

              {/* Opção Mural de Avisos (FEED) */}
              <div
                onClick={() => setChannelType("FEED")}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${channelType === "FEED"
                    ? "bg-mint-500/10 border-mint-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${channelType === "FEED"
                      ? "bg-mint-500 text-slate-900"
                      : "bg-slate-800 text-slate-400"
                    }`}
                >
                  <MessageSquare size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Mural de Avisos</p>
                  <p className="text-[11px] text-slate-400">
                    Mural para comunicados oficiais dos donos e moderadores
                  </p>
                </div>
              </div>

              {/* Opção Canal de Voz */}
              <div
                onClick={() => setChannelType("VOICE")}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${channelType === "VOICE"
                    ? "bg-mint-500/10 border-mint-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${channelType === "VOICE"
                      ? "bg-mint-500 text-slate-900"
                      : "bg-slate-800 text-slate-400"
                    }`}
                >
                  <Volume2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Voz</p>
                  <p className="text-[11px] text-slate-400">
                    Converse por voz, compartilhe tela e faça reuniões
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nome do Canal */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Nome do Canal
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-500 font-bold text-sm">
                {channelType === "FEED" ? "📢" : channelType === "CHAT" ? "#" : "🔊"}
              </span>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder={
                  channelType === "FEED"
                    ? "mural-de-avisos"
                    : channelType === "CHAT"
                      ? "novo-canal"
                      : "sala-de-voz"
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-mint-500 focus:outline-none transition-colors font-medium"
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          {/* Nível de Acesso do Canal */}
          <div className="pt-2 border-t border-slate-700/50 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Nível de Acesso & Visibilidade
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAccessLevel("PUBLIC")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${accessLevel === "PUBLIC"
                    ? "bg-mint-500/10 border-mint-500 text-mint-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                <span>🌐 Público</span>
                <span className="text-[9px] text-slate-500 font-normal">Todos membros</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessLevel("PRIVATE")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${accessLevel === "PRIVATE"
                    ? "bg-mint-500/10 border-mint-500 text-mint-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                <span>🔒 Privado</span>
                <span className="text-[9px] text-slate-500 font-normal">Cargos Específicos</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessLevel("STAFF_ONLY")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${accessLevel === "STAFF_ONLY"
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                <span>🛡️ Staff Apenas</span>
                <span className="text-[9px] text-slate-500 font-normal">Mods & Dono</span>
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2.5 bg-mint-500 hover:bg-mint-600 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Criando...
                </>
              ) : (
                "Criar Canal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
