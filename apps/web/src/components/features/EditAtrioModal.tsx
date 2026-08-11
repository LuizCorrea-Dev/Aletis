"use client";

import { useState, useRef } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Film,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import { updateAtrioItemAction, AtrioItemData } from "@/app/actions/atrio-actions";

interface EditAtrioModalProps {
  item: AtrioItemData;
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

const MAX_IMAGE_SIZE_MB = 15;
const MAX_VIDEO_SIZE_MB = 150;
const MAX_PDF_SIZE_MB = 25;

export function EditAtrioModal({ item, onClose, onSuccess }: EditAtrioModalProps) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [tagsInput, setTagsInput] = useState((item.tags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(", "));
  const [url, setUrl] = useState(item.url || "");
  const [mediaPreview, setMediaPreview] = useState<string | null>(item.url || null);
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
      setUrl(dataUrl);
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
          message: `O vídeo "${filename}" utiliza o formato "${extension}". Apenas vídeos em MP4 ou WEBM são suportados.`,
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
      setUrl(dataUrl);
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
          recommendation: "Comprima o PDF antes de enviar.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const dataUrl = await readFileAsDataURL(file);
      setMediaPreview(dataUrl);
      setUrl(dataUrl);
    }
    // 4. Formatos Não Suportados
    else {
      setFileError({
        title: "Formato Não Suportado",
        filename,
        actualSizeMB: fileSizeMB,
        actualExtension: extension,
        allowedExtensions: [".png", ".jpg", ".webp", ".mp4", ".webm", ".pdf"],
        message: `O arquivo "${filename}" (extensão ${extension}) não é suportado.`,
        recommendation: "Envie apenas fotos (.png, .jpg), vídeos (.mp4, .webm) ou documentos (.pdf).",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Título é obrigatório.");
      return;
    }
    if (!url.trim() && !mediaPreview) {
      setError("Uma mídia é obrigatória para a obra do Átrio.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFileError(null);

    try {
      let finalUrl = mediaPreview || url.trim();

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("tags", tagsInput.trim());
      formData.append("url", finalUrl);

      const res = await updateAtrioItemAction(item.id, formData);

      if (res.success) {
        onSuccess();
      } else {
        const msg = res.message || "Erro ao atualizar item do Átrio.";
        if (msg.includes("Failed to find Server Action")) {
          setFileError({
            title: "Sessão do Servidor Desatualizada",
            filename: "Server Action",
            message: "O servidor foi recompilado e a ação precisa ser recarregada no seu navegador.",
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
          message: "O servidor foi recompilado e as ações precisam ser recarregadas.",
          recommendation: "Pressione F5 para recarregar a página.",
          actionButton: {
            label: "Recarregar Página (F5)",
            onClick: () => window.location.reload(),
          },
        });
      } else {
        setError(errStr || "Erro inesperado.");
      }
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
              <h2 className="text-lg font-extrabold text-white font-display">Editar Obra do Átrio</h2>
              <p className="text-xs text-slate-400">Atualize fotos, vídeos, PDFs e reflexões</p>
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
                      <span className="font-bold text-[#2dd4bf] block">Até {fileError.maxSizeMB} MB</span>
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

          {/* Upload de Mídia */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Mídia da Obra (Fotos 15MB, Vídeos 150MB, PDFs 25MB) *
            </label>

            {mediaPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 mb-3">
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
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-black/70 hover:bg-[#2dd4bf] hover:text-slate-950 text-white rounded-xl backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Trocar Mídia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview(null);
                      setUrl("");
                    }}
                    className="p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border border-dashed border-slate-700 hover:border-[#2dd4bf] rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all bg-slate-900/40 cursor-pointer mb-3"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-[#50c878]" />
                  <Film size={20} className="text-blue-400" />
                  <FileText size={20} className="text-amber-400" />
                </div>
                <span className="text-xs font-bold">Fazer Upload de Nova Mídia</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div>
              <span className="text-[10px] font-medium text-slate-500 block mb-1">ou Cole a URL da mídia:</span>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setMediaPreview(e.target.value);
                }}
                placeholder="https://..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
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
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Salvar Alterações <Save size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
