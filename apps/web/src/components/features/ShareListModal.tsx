"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Shield, Eye, Edit3, Trash2, Loader2, Sparkles } from "lucide-react";
import {
  addListCollaboratorAction,
  removeListCollaboratorAction,
  getListCollaboratorsAction,
  AtrioCollaboratorData,
} from "@/app/actions/atrio-actions";

interface ShareListModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export function ShareListModal({ listId, listName, onClose }: ShareListModalProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [permission, setPermission] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [collaborators, setCollaborators] = useState<AtrioCollaboratorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadCollaborators = async () => {
    setIsLoading(true);
    try {
      const data = await getListCollaboratorsAction(listId);
      setCollaborators(data);
    } catch (err) {
      console.error("loadCollaborators error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [listId]);

  const handleAddCollaborator = async () => {
    if (!usernameInput.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await addListCollaboratorAction(listId, usernameInput.trim(), permission);
      if (res.success) {
        setSuccessMsg(res.message);
        setUsernameInput("");
        await loadCollaborators();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao compartilhar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorUserId: string) => {
    try {
      const res = await removeListCollaboratorAction(listId, collaboratorUserId);
      if (res.success) {
        setCollaborators((prev) => prev.filter((c) => c.userId !== collaboratorUserId));
      }
    } catch (err: any) {
      console.error("Remove collaborator error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-display">Compartilhar Lista</h3>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{listName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Adicionar Usuário */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Convidar Usuário por Username ou Nome
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ex: @joao ou joao@email.com"
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCollaborator}
                disabled={isSubmitting || !usernameInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Convidar"}
              </button>
            </div>

            {/* Seleção de Permissão */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPermission("VIEWER")}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  permission === "VIEWER"
                    ? "bg-blue-500/15 border-blue-500/50 text-white"
                    : "bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Eye size={14} className={permission === "VIEWER" ? "text-blue-400" : ""} />
                <div>
                  <p className="text-xs font-bold">Só Visualizar</p>
                  <p className="text-[9px] text-slate-400">Pode ver a lista</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPermission("EDITOR")}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  permission === "EDITOR"
                    ? "bg-[#2dd4bf]/15 border-[#2dd4bf]/50 text-white"
                    : "bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Edit3 size={14} className={permission === "EDITOR" ? "text-[#2dd4bf]" : ""} />
                <div>
                  <p className="text-xs font-bold">Adicionar & Remover</p>
                  <p className="text-[9px] text-slate-400">Co-gerenciar obras</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
              {successMsg}
            </p>
          )}

          {/* Lista de Colaboradores Existentes */}
          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pessoas com Acesso ({collaborators.length})
            </p>
            {isLoading ? (
              <div className="py-4 flex justify-center text-blue-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : collaborators.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-700/80 rounded-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          c.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`
                        }
                        alt={c.name}
                        className="w-8 h-8 rounded-xl object-cover bg-slate-800"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <span className="text-[9px] text-[#2dd4bf] font-mono">@{c.username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          c.permission === "EDITOR"
                            ? "bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/40"
                            : "bg-slate-700 text-slate-300 border-slate-600"
                        }`}
                      >
                        {c.permission === "EDITOR" ? "Editor" : "Leitor"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(c.userId)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Remover acesso"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Esta lista ainda não foi compartilhada com ninguém.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
