"use client";

import { useState, useRef } from "react";
import { X, Hash, Loader2, Send, Upload, Edit2 } from "lucide-react";
import { updatePostAction } from "@/app/actions/post-actions";
import { Post } from "./PostCard";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

const SUGGESTED_TAGS = ["gratidão", "paz", "superação", "leveza", "amor", "crescimento", "esperança", "cura"];

export function EditPostModal({ post, onClose, onSuccess }: EditPostModalProps) {
  const [content, setContent] = useState(post.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(post.mediaUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTagsFromText = (text: string) => {
    const newTags = text
      .split(",")
      .map((t) => t.replace(/^#/, "").trim())
      .filter((t) => t.length > 0);

    if (newTags.length > 0) {
      setSelectedTags((prev) => {
        const set = new Set([...prev, ...newTags]);
        return Array.from(set);
      });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      addTagsFromText(val);
      setTagInput("");
    } else {
      setTagInput(val);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTagsFromText(tagInput);
        setTagInput("");
      }
    }
  };

  const commitTagInput = () => {
    if (tagInput.trim()) {
      addTagsFromText(tagInput);
      setTagInput("");
    }
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const removeTag = (t: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== t));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("O conteúdo não pode estar vazio.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      let finalTags = [...selectedTags];
      if (tagInput.trim()) {
        const extra = tagInput.split(",").map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
        finalTags = Array.from(new Set([...finalTags, ...extra]));
      }

      const formData = new FormData();
      formData.append("content", content.trim());
      if (finalTags.length > 0) {
        formData.append("tags", JSON.stringify(finalTags));
      }
      if (mediaPreview) {
        formData.append("mediaUrl", mediaPreview);
      }

      const result = await updatePostAction(post.id, formData);

      if (result?.success) {
        onSuccess();
      } else {
        setError(result?.message || "Erro ao atualizar postagem.");
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-xl rounded-t-3xl md:rounded-3xl border-t md:border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div>
            <h2 className="text-lg font-extrabold text-white font-display flex items-center gap-2">
              <Edit2 size={18} className="text-[#50c878]" />
              Editar Publicação
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que está pesando no seu coração hoje? Este espaço é seguro."
            rows={5}
            maxLength={2000}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl p-4 text-slate-200 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-[#50c878] transition-colors resize-none"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium -mt-2">
            <span>Ambiente seguro</span>
            <span>{content.length}/2000</span>
          </div>

          {/* Essência / Tags (Input + Multisseleção) */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">
              Essência / Tag
            </label>

            {/* Campo para Digitar Tags Novas */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Digite uma tag (separe por vírgula ou Enter)..."
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#50c878] transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={commitTagInput}
                disabled={!tagInput.trim()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>

            {/* Chips de Tags Selecionadas */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl">
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#50c878]/20 text-[#50c878] border border-[#50c878]/40 animate-in fade-in zoom-in duration-150"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-white transition-colors p-0.5 rounded-full hover:bg-[#50c878]/30 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Sugestões de Tags (Multisseleção) */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[#50c878] text-[#1e293b] border-[#50c878] shadow-sm"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    <Hash size={10} /> {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mídia */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">
              Imagem (opcional)
            </label>
            {mediaPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700">
                <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-all"
              >
                <Upload size={20} />
                <span className="text-xs font-bold">Adicionar imagem</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Erro */}
          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-700/60 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-2xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="flex-1 bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Salvar Alterações
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
