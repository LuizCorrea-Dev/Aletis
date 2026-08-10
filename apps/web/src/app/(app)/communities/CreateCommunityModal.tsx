"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, Lock, Globe, Tag, Loader2, Sparkles } from "lucide-react";
import { createCommunityAction } from "@/app/actions/community-actions";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommunityModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["comunidade", "conexão"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/^#/, "");
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags((prev) => [...prev, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setErrorMsg("O nome da tribo deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const result = await createCommunityAction({
        name: name.trim(),
        description: description.trim(),
        privacy,
        tags,
      });

      if (result.success && result.data) {
        onClose();
        if (onSuccess) onSuccess();
        router.push(`/communities/${result.data.id}`);
      } else {
        setErrorMsg(result.message || "Erro ao criar tribo. Tente novamente.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro inesperado ao criar a tribo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-display">
                Criar Nova Tribo
              </h2>
              <p className="text-xs text-slate-400">
                Crie um espaço de acolhimento e conexão.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Nome da Tribo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Círculo da Atenção Plena"
              className="w-full bg-slate-900/70 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7] transition-colors"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Propósito / Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a intenção e os valores desta tribo..."
              className="w-full bg-slate-900/70 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7] transition-colors resize-none"
            />
          </div>

          {/* Privacidade */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Privacidade
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrivacy("PUBLIC")}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  privacy === "PUBLIC"
                    ? "bg-[#50c878]/10 border-[#50c878] text-white"
                    : "bg-slate-900/40 border-slate-700/80 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Globe size={18} className={privacy === "PUBLIC" ? "text-[#50c878]" : "text-slate-500"} />
                <div>
                  <p className="text-xs font-bold">Pública</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Qualquer um pode encontrar e entrar.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy("PRIVATE")}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  privacy === "PRIVATE"
                    ? "bg-[#a855f7]/10 border-[#a855f7] text-white"
                    : "bg-slate-900/40 border-slate-700/80 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Lock size={18} className={privacy === "PRIVATE" ? "text-[#a855f7]" : "text-slate-500"} />
                <div>
                  <p className="text-xs font-bold">Privada</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Apenas por convite ou aprovação.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Tags / Interesses (máx 5)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#a855f7]/20 border border-[#a855f7]/40 text-purple-300 px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Pressione Enter para adicionar tag..."
                className="w-full bg-slate-900/70 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7]"
              />
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold text-xs py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(80,200,120,0.3)] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <span>Criar Tribo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
