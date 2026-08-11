"use client";

import { useState, useRef } from "react";
import {
  X,
  Hash,
  Loader2,
  Send,
  Upload,
  Edit2,
  Image as ImageIcon,
  Film,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import { updatePostAction } from "@/app/actions/post-actions";
import { Post } from "./PostCard";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FileErrorDetail {
  title: string;
  filename: string;
  actualSizeMB?: number;
  maxSizeMB?: number;
  actualExtension?: string;
  allowedExtensions?: string[];
  message: string;
  recommendation?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const SUGGESTED_TAGS = ["gratidão", "paz", "superação", "leveza", "amor", "crescimento", "esperança", "cura"];

const MAX_IMAGE_SIZE_MB = 15;
const MAX_VIDEO_SIZE_MB = 150;
const MAX_PDF_SIZE_MB = 25;

export function EditPostModal({ post, onClose, onSuccess }: EditPostModalProps) {
  const [content, setContent] = useState(post.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(post.mediaUrl || null);
  const [fileError, setFileError] = useState<FileErrorDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setError(null);

    const fileSizeMB = file.size / (1024 * 1024);
    const mimeType = file.type.toLowerCase();
    const filename = file.name;
    const extension = filename.includes(".") ? `.${filename.split(".").pop()?.toLowerCase()}` : "Desconhecido";

    // 1. Fotos / Imagens
    if (mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(extension)) {
      if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
        setFileError({
          title: "Tamanho de Foto Excedido",
          filename,
          actualSizeMB: fileSizeMB,
          maxSizeMB: MAX_IMAGE_SIZE_MB,
          actualExtension: extension,
          allowedExtensions: [".png", ".jpg", ".webp", ".gif"],
          message: `A imagem "${filename}" possui ${fileSizeMB.toFixed(1)} MB, ultrapassando o limite máximo de ${MAX_IMAGE_SIZE_MB} MB.`,
          recommendation: "Comprima a imagem ou selecione uma foto de menor resolução.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const dataUrl = await readFileAsDataURL(file);
      setMediaPreview(dataUrl);
    }
    // 2. Vídeos (MP4, WEBM)
    else if (mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".mkv", ".avi"].includes(extension)) {
      if (![".mp4", ".webm"].includes(extension) && !mimeType.includes("mp4") && !mimeType.includes("webm")) {
        setFileError({
          title: "Formato de Vídeo Incompatível",
          filename,
          actualSizeMB: fileSizeMB,
          actualExtension: extension,
          allowedExtensions: [".mp4", ".webm"],
          message: `O vídeo "${filename}" utiliza o formato "${extension}". Apenas vídeos em MP4 ou WEBM são reproduzidos nativamente no feed.`,
          recommendation: "Converta seu vídeo para a extensão .mp4 ou .webm antes de enviar.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
        setFileError({
          title: "Tamanho de Vídeo Excedido",
          filename,
          actualSizeMB: fileSizeMB,
          maxSizeMB: MAX_VIDEO_SIZE_MB,
          actualExtension: extension,
          allowedExtensions: [".mp4", ".webm"],
          message: `O vídeo "${filename}" possui ${fileSizeMB.toFixed(1)} MB, ultrapassando o limite de ${MAX_VIDEO_SIZE_MB} MB.`,
          recommendation: "Reduza a resolução do vídeo ou comprima o arquivo antes do envio.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const dataUrl = await readFileAsDataURL(file);
      setMediaPreview(dataUrl);
    }
    // 3. Documentos PDF
    else if (mimeType === "application/pdf" || extension === ".pdf") {
      if (fileSizeMB > MAX_PDF_SIZE_MB) {
        setFileError({
          title: "Tamanho de PDF Excedido",
          filename,
          actualSizeMB: fileSizeMB,
          maxSizeMB: MAX_PDF_SIZE_MB,
          actualExtension: extension,
          allowedExtensions: [".pdf"],
          message: `O PDF "${filename}" possui ${fileSizeMB.toFixed(1)} MB, ultrapassando o limite de ${MAX_PDF_SIZE_MB} MB.`,
          recommendation: "Comprima o PDF antes do envio.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const dataUrl = await readFileAsDataURL(file);
      setMediaPreview(dataUrl);
    }
    // 4. Formatos Não Suportados
    else {
      setFileError({
        title: "Formato Não Suportado",
        filename,
        actualSizeMB: fileSizeMB,
        actualExtension: extension,
        allowedExtensions: [".png", ".jpg", ".webp", ".mp4", ".webm", ".pdf"],
        message: `O arquivo "${filename}" (extensão ${extension}) não é suportado pelo Aletis.`,
        recommendation: "Envie apenas fotos (.png, .jpg), vídeos (.mp4, .webm) ou documentos (.pdf).",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
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
    setFileError(null);

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
        const msg = result?.message || "Erro ao atualizar postagem.";
        if (msg.includes("Failed to find Server Action")) {
          setFileError({
            title: "Sessão do Servidor Desatualizada",
            filename: "Server Action",
            message: "O servidor foi recompilado e as ações precisam ser recarregadas no seu navegador.",
            recommendation: "Pressione F5 ou clique no botão abaixo para recarregar a página.",
            actionButton: {
              label: "Recarregar Página (F5)",
              onClick: () => window.location.reload(),
            },
          });
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      const errStr = String(err?.message || err || "");
      if (errStr.includes("Failed to find Server Action")) {
        setFileError({
          title: "Sessão do Servidor Desatualizada",
          filename: "Server Action",
          message: "O servidor foi recompilado e a ação precisa ser recarregada no seu navegador.",
          recommendation: "Pressione F5 para recarregar a página.",
          actionButton: {
            label: "Recarregar Página (F5)",
            onClick: () => window.location.reload(),
          },
        });
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
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

          {/* Essência / Tags */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">
              Essência / Tag
            </label>

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

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${isSelected
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

          {/* Banner de Feedback Visual de Erros */}
          {fileError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3 animate-in fade-in shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-rose-400 font-display">
                    {fileError.title}
                  </h4>
                  <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                    {fileError.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFileError(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 pb-1.5 border-b border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Arquivo</span>
                    <span className="font-bold text-rose-300 truncate block">{fileError.filename}</span>
                    {fileError.actualSizeMB !== undefined && (
                      <span className="text-rose-400 block">{fileError.actualSizeMB.toFixed(1)} MB</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Limite Permitido</span>
                    {fileError.maxSizeMB !== undefined && (
                      <span className="font-bold text-[#50c878] block">Até {fileError.maxSizeMB} MB</span>
                    )}
                  </div>
                </div>

                {fileError.recommendation && (
                  <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-0.5">
                    <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Recomendação:</strong> {fileError.recommendation}</span>
                  </div>
                )}

                {fileError.actionButton && (
                  <button
                    type="button"
                    onClick={fileError.actionButton.onClick}
                    className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 mt-1"
                  >
                    <RefreshCw size={12} />
                    {fileError.actionButton.label}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mídia */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">
              Mídia (Fotos 15MB, Vídeos 150MB, PDFs 25MB)
            </label>
            {mediaPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
                {mediaPreview.startsWith("data:video/") || mediaPreview.endsWith(".mp4") || mediaPreview.endsWith(".webm") ? (
                  <video src={mediaPreview} controls className="w-full max-h-48 rounded-2xl bg-black" />
                ) : mediaPreview.startsWith("data:application/pdf") || mediaPreview.endsWith(".pdf") ? (
                  <div className="p-6 bg-slate-800 flex items-center gap-3">
                    <FileText size={32} className="text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Documento PDF</p>
                    </div>
                  </div>
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-all cursor-pointer bg-slate-900/30"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-[#50c878]" />
                  <Film size={20} className="text-blue-400" />
                  <FileText size={20} className="text-amber-400" />
                </div>
                <span className="text-xs font-bold">Adicionar Foto, Vídeo ou PDF</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Erro */}
          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-700/60 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-2xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="flex-1 bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
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
