"use client";

import { useState, useRef } from "react";
import { X, Sparkles, Upload, Loader2 } from "lucide-react";
import { createAtrioItemAction } from "@/app/actions/atrio-actions";

interface CreateAtrioModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAtrioModal({ onClose, onSuccess }: CreateAtrioModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Dê um título para sua obra de contemplação.");
      return;
    }
    if (!mediaPreview) {
      setError("Adicione uma imagem para publicar no Átrio.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("tags", tagsInput.trim());
      formData.append("url", mediaPreview);
      formData.append("color", "bg-[#50c878]");

      const res = await createAtrioItemAction(formData);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Erro ao publicar no Átrio.");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-display">Nova Obra no Átrio</h2>
              <p className="text-xs text-slate-400">Compartilhe uma imagem contemplativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Título da Obra *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Serenidade do Amanhecer"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Descrição / Reflexão Contemplativa
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escreva a mensagem ou sentimento por trás desta imagem..."
              rows={4}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Tags / Temas (Opcional)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: #paz, #natureza, #silencio (separadas por vírgula)"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Imagem da Obra *
            </label>
            {mediaPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700">
                <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border border-dashed border-slate-700 hover:border-[#2dd4bf] rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all bg-slate-900/40 cursor-pointer"
              >
                <Upload size={22} className="text-[#2dd4bf]" />
                <span className="text-xs font-bold">Enviar Imagem da Obra</span>
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

          {error && (
            <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700/60 flex justify-end gap-3 bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Publicar no Átrio"}
          </button>
        </div>
      </div>
    </div>
  );
}
