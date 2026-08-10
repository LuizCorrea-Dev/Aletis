"use client";

import React, { useState } from "react";
import { X, Hash, Volume2, Lock, Loader2, MessageSquare, Save, Settings } from "lucide-react";
import { ChannelType, Channel } from "@aletis/domain";
import { updateChannelAction } from "@/app/actions/community-actions";

interface EditChannelModalProps {
  communityId: string;
  channel: Channel;
  onClose: () => void;
  onUpdated: (updatedChannel: Channel) => void;
}

export default function EditChannelModal({
  communityId,
  channel,
  onClose,
  onUpdated,
}: EditChannelModalProps) {
  const [name, setName] = useState(channel.name);
  const [channelType, setChannelType] = useState<ChannelType>(channel.type || "CHAT");
  const [accessLevel, setAccessLevel] = useState<"PUBLIC" | "PRIVATE" | "STAFF_ONLY">(
    channel.isPrivate ? "PRIVATE" : "PUBLIC"
  );
  const [topic, setTopic] = useState(channel.topic || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await updateChannelAction(communityId, channel.id, {
        name: name.trim(),
        type: channelType,
        isPrivate: accessLevel !== "PUBLIC",
        topic: topic.trim(),
      });

      if (res.success) {
        onUpdated({
          ...channel,
          name: name.trim(),
          type: channelType,
          isPrivate: accessLevel !== "PUBLIC",
          accessLevel,
          topic: topic.trim(),
        });
        onClose();
      } else {
        setErrorMsg(res.message || "Erro ao atualizar o canal.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao atualizar o canal. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/60 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-mint-500/10 text-mint-450 rounded-xl border border-mint-500/20">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg font-display tracking-tight">
                Editar Canal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere o nome, privacidade e configurações deste espaço
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Nome do Canal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Nome do Canal
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                #
              </span>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="nome-do-canal"
                maxLength={40}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Tópico do Canal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tópico / Descrição
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Descreva o propósito deste canal..."
              maxLength={120}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
            />
          </div>

          {/* Tipo de Canal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Canal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannelType("CHAT")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  channelType === "CHAT"
                    ? "bg-mint-500/10 border-mint-500/50 text-mint-450"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Hash size={18} />
                <span>Texto</span>
              </button>

              <button
                type="button"
                onClick={() => setChannelType("VOICE")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  channelType === "VOICE"
                    ? "bg-mint-500/10 border-mint-500/50 text-mint-450"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Volume2 size={18} />
                <span>Voz</span>
              </button>

              <button
                type="button"
                onClick={() => setChannelType("FEED")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  channelType === "FEED"
                    ? "bg-mint-500/10 border-mint-500/50 text-mint-450"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <MessageSquare size={18} />
                <span>Avisos</span>
              </button>
            </div>
          </div>

          {/* Nível de Acesso */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Privacidade
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  accessLevel === "PUBLIC"
                    ? "bg-slate-800/80 border-mint-500/40 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="accessLevel"
                  checked={accessLevel === "PUBLIC"}
                  onChange={() => setAccessLevel("PUBLIC")}
                  className="hidden"
                />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="flex-1">
                  <div className="text-xs font-bold">Público</div>
                  <div className="text-[10px] text-slate-400">Todos os membros podem acessar</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  accessLevel === "PRIVATE"
                    ? "bg-slate-800/80 border-mint-500/40 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="accessLevel"
                  checked={accessLevel === "PRIVATE"}
                  onChange={() => setAccessLevel("PRIVATE")}
                  className="hidden"
                />
                <Lock size={14} className="text-amber-400" />
                <div className="flex-1">
                  <div className="text-xs font-bold">Privado</div>
                  <div className="text-[10px] text-slate-400">Apenas membros autorizados</div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-mint-400 hover:bg-mint-300 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-mint-500/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
