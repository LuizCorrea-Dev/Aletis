"use client";

import { useState, useRef } from "react";
import {
  X,
  Hash,
  Loader2,
  Send,
  Upload,
  Image as ImageIcon,
  Film,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import { createPostAction } from "@/app/actions/post-actions";
import { PrivacySelector, PrivacyConfig } from "./PrivacySelector";
import { CrisisEmergencyModal, CrisisData } from "./CrisisEmergencyModal";

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: (reward?: any) => void;
  communityId?: string;
}

export interface MediaItem {
  id: string;
  type: "image" | "video" | "pdf";
  url: string;
  name: string;
  sizeMB: number;
}

const SUGGESTED_TAGS = ["gratidão", "paz", "superação", "leveza", "amor", "crescimento", "esperança", "cura"];

const MAX_IMAGE_SIZE_MB = 15;
const MAX_VIDEO_SIZE_MB = 150;
const MAX_PDF_SIZE_MB = 25;
const MAX_DIMENSION_PX = 4096;

export interface FileErrorDetail {
  title: string;
  filename?: string;
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

export function CreatePostModal({ onClose, onSuccess, communityId }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [fileError, setFileError] = useState<FileErrorDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisData, setCrisisData] = useState<CrisisData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [privacy, setPrivacy] = useState<PrivacyConfig>({
    isAuthorAnonymous: true,
    authorVisibilityLevel: "PUBLIC",
    allowedGroupIds: [],
    allowedUserIds: [],
  });

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
      reader.readAsDataURL(file);
    });
  };

  const compressImageFile = (file: File, maxWidth: number, maxHeight: number, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Erro ao carregar imagem para compressão."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo de imagem."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFileError(null);
    setError(null);

    const newItems: MediaItem[] = [];

    for (const file of files) {
      const fileSizeMB = file.size / (1024 * 1024);
      const mimeType = file.type.toLowerCase();
      const filename = file.name;

      if (mimeType.startsWith("image/")) {
        if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
          setFileError({
            title: "Imagem muito grande para publicar",
            message: `A foto "${filename}" tem ${fileSizeMB.toFixed(1)} MB e ultrapassa o limite de ${MAX_IMAGE_SIZE_MB} MB.`,
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        try {
          const compressed = await compressImageFile(file, 2048, 2048, 0.85);
          newItems.push({
            id: crypto.randomUUID(),
            type: "image",
            url: compressed,
            name: filename,
            sizeMB: fileSizeMB,
          });
        } catch {
          const raw = await readFileAsDataURL(file);
          newItems.push({
            id: crypto.randomUUID(),
            type: "image",
            url: raw,
            name: filename,
            sizeMB: fileSizeMB,
          });
        }
      } else if (mimeType.startsWith("video/")) {
        if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
          setFileError({
            title: "Vídeo muito grande para publicar",
            message: `O vídeo "${filename}" tem ${fileSizeMB.toFixed(1)} MB e ultrapassa o limite de ${MAX_VIDEO_SIZE_MB} MB.`,
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        const raw = await readFileAsDataURL(file);
        newItems.push({
          id: crypto.randomUUID(),
          type: "video",
          url: raw,
          name: filename,
          sizeMB: fileSizeMB,
        });
      } else if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
        if (fileSizeMB > MAX_PDF_SIZE_MB) {
          setFileError({
            title: "Documento PDF muito grande",
            message: `O arquivo PDF "${filename}" tem ${fileSizeMB.toFixed(1)} MB e ultrapassa o limite de ${MAX_PDF_SIZE_MB} MB.`,
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        const raw = await readFileAsDataURL(file);
        newItems.push({
          id: crypto.randomUUID(),
          type: "pdf",
          url: raw,
          name: filename,
          sizeMB: fileSizeMB,
        });
      } else {
        setFileError({
          title: "Formato de arquivo não suportado",
          message: `O arquivo "${filename}" não é suportado.`,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setMediaItems((prev) => [...prev, ...newItems]);
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
      setError("Escreva algo antes de compartilhar.");
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
      formData.append("type", "post");
      if (finalTags.length > 0) {
        formData.append("tags", JSON.stringify(finalTags));
      }
      if (communityId) formData.append("communityId", communityId);

      if (mediaItems.length > 0) {
        if (mediaItems.length === 1) {
          formData.append("mediaUrl", mediaItems[0].url);
        } else {
          formData.append("mediaUrl", JSON.stringify(mediaItems.map((m) => m.url)));
        }
      }

      formData.append("isAuthorAnonymous", String(privacy.isAuthorAnonymous));
      formData.append("authorVisibilityLevel", privacy.authorVisibilityLevel);
      formData.append("allowedGroupIds", JSON.stringify(privacy.allowedGroupIds));
      formData.append("allowedUserIds", JSON.stringify(privacy.allowedUserIds));

      const result = await createPostAction(formData);

      if (result?.success) {
        onSuccess((result as any).reward);
      } else if (result?.isCrisis && result?.crisisData) {
        setCrisisData(result.crisisData as CrisisData);
      } else {
        const msg = result?.message || "Erro ao publicar.";
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
        } else if (
          msg.includes("violates foreign key constraint") ||
          msg.includes("posts_author_id_fkey") ||
          msg.includes("23503") ||
          msg.includes("Sua conta não foi encontrada")
        ) {
          setFileError({
            title: "Sessão de Conta Não Localizada",
            filename: "Perfil de Usuário",
            message: "Sua conta de usuário não foi encontrada no banco de dados ativo. Isso acontece se o banco de dados foi recriado ou reiniciado.",
            recommendation: "Clique abaixo para revalidar sua conta fazendo login novamente.",
            actionButton: {
              label: "Ir para a Tela de Login",
              onClick: () => {
                window.location.href = "/";
              },
            },
          });
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      const errStr = String(err?.message || err || "");
      if (
        errStr.includes("violates foreign key constraint") ||
        errStr.includes("posts_author_id_fkey") ||
        errStr.includes("23503") ||
        errStr.includes("Sua conta não foi encontrada")
      ) {
        setFileError({
          title: "Sessão de Conta Não Localizada",
          filename: "Perfil de Usuário",
          message: "Sua conta de usuário não consta no banco de dados ativo.",
          recommendation: "Faça login novamente no Aletis para revalidar a sua sessão.",
          actionButton: {
            label: "Ir para a Tela de Login",
            onClick: () => {
              window.location.href = "/";
            },
          },
        });
      } else {
        setError("Erro inesperado ao publicar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {crisisData && (
        <CrisisEmergencyModal
          crisisData={crisisData}
          onClose={() => {
            setCrisisData(null);
            onClose();
          }}
        />
      )}

      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
        <div className="bg-[#1e293b] w-full max-w-xl rounded-t-3xl md:rounded-3xl border-t md:border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
            <div>
              <h2 className="text-lg font-extrabold text-white font-display">Nova Vibe</h2>
              <p className="text-xs text-slate-400">Compartilhe fotos, vídeos, documentos ou textos</p>
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
              rows={4}
              maxLength={2000}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl p-4 text-slate-200 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-[#50c878] transition-colors resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium -mt-2">
              <span>Ambiente seguro e anônimo</span>
              <span>{content.length}/2000</span>
            </div>

            {/* Privacy Selector */}
            <PrivacySelector onChange={setPrivacy} />

            {/* Essência / Tags */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">
                Essência / Tag
              </label>

              <div className="flex items-center gap-2 mb-3 relative">
                <div className="relative flex-1">
                  <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Digite uma tag (ex: gratidão, paz)..."
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#50c878] transition-colors"
                  />
                  {/* Autocomplete Dropdown no Modal */}
                  {tagInput.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto p-1 backdrop-blur-md">
                      {SUGGESTED_TAGS.filter((t) => t.toLowerCase().includes(tagInput.toLowerCase().replace(/^#/, "").trim())).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            addTagsFromText(tag);
                            setTagInput("");
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-[#50c878]/20 hover:text-[#50c878] rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span>#{tag}</span>
                          <span className="text-[10px] text-slate-400">Selecionar</span>
                        </button>
                      ))}
                    </div>
                  )}
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

            {/* Visual Error Feedback Banner when file is too big */}
            {fileError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-rose-400 font-display">{fileError.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">{fileError.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFileError(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <p className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                    Limites de Tamanhos e Formatos Permitidos:
                  </p>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={13} className="text-[#50c878] shrink-0" />
                    <span><strong>Fotos / Imagens:</strong> até {MAX_IMAGE_SIZE_MB} MB (dimensões máx. {MAX_DIMENSION_PX}×{MAX_DIMENSION_PX}px). Suporta múltiplas fotos.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Film size={13} className="text-blue-400 shrink-0" />
                    <span><strong>Vídeos (MP4, WEBM):</strong> até {MAX_VIDEO_SIZE_MB} MB.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-amber-400 shrink-0" />
                    <span><strong>Documentos PDF:</strong> até {MAX_PDF_SIZE_MB} MB.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mídia Anexada (Fotos, Vídeos, PDFs) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">
                  Anexos (Fotos, Vídeos, PDFs)
                </label>
                {mediaItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMediaItems([])}
                    className="text-[11px] text-rose-400 hover:underline font-bold cursor-pointer"
                  >
                    Remover Todos
                  </button>
                )}
              </div>

              {/* Lista/Grid de Arquivos Anexados */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/80 p-2 flex flex-col justify-between group shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => setMediaItems((prev) => prev.filter((m) => m.id !== item.id))}
                        className="absolute top-3 right-3 z-20 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer"
                        title="Remover anexo"
                      >
                        <X size={14} />
                      </button>

                      {item.type === "image" && (
                        <div className="h-36 overflow-hidden rounded-xl relative">
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] text-white font-bold flex items-center gap-1">
                            <ImageIcon size={12} className="text-[#50c878]" /> {item.sizeMB.toFixed(1)} MB
                          </span>
                        </div>
                      )}

                      {item.type === "video" && (
                        <div className="rounded-xl overflow-hidden relative bg-black">
                          <video src={item.url} controls className="w-full max-h-36 rounded-xl" />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-md text-[10px] text-white font-bold flex items-center gap-1">
                            <Film size={12} className="text-blue-400" /> Vídeo ({item.sizeMB.toFixed(1)} MB)
                          </span>
                        </div>
                      )}

                      {item.type === "pdf" && (
                        <div className="p-4 bg-slate-800/80 rounded-xl flex items-center gap-3 border border-slate-700">
                          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                            <FileText size={24} />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Documento PDF ({item.sizeMB.toFixed(1)} MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Botão para Selecionar Arquivos */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#50c878] hover:text-white transition-all bg-slate-900/30 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-slate-300">
                  <ImageIcon size={20} className="text-[#50c878]" />
                  <Film size={20} className="text-blue-400" />
                  <FileText size={20} className="text-amber-400" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-200 block">
                    Adicionar Fotos, Vídeo ou PDF
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Fotos até 15MB, Vídeos até 50MB, PDFs até 25MB
                  </span>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Erro Geral */}
            {error && (
              <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-slate-700/60">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="w-full bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Compartilhar Vibe
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
