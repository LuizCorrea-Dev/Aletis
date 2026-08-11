"use client";

import { useState } from "react";
import {
  MessageCircle, Share2, Pin, AlertCircle,
  AlertTriangle, Trash2, Loader2, Edit2, FileText, Download, Film, Image as ImageIcon
} from "lucide-react";
import { VibeZapButton, CommentSection } from "@/components/molecules";
import { cn } from "@/lib/utils";

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mediaUrl?: string;
  tags?: string[];
  totalVibesReceived: number;
  totalComments: number;
  userHasLiked?: boolean;
  isPinned?: boolean;
  createdAt?: string;
}

export interface PostCardProps extends Post {
  canDelete?: boolean;
  canEdit?: boolean;
  canPin?: boolean;
  onDelete?: () => void | Promise<void>;
  onEdit?: () => void;
  onPin?: () => void | Promise<void>;
  onTagClick?: (tag: string) => void;
  onClick?: () => void;
  onVibeClick?: () => void;
  isVibeLoading?: boolean;
  onUpdated?: () => void;
}

export const PostCard = ({
  id, authorId, authorName, authorAvatar, content, mediaUrl, tags,
  totalVibesReceived, totalComments, userHasLiked, isPinned,
  canDelete, canEdit, canPin, onDelete, onEdit, onPin, onTagClick, onClick, onVibeClick, isVibeLoading, onUpdated
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [editContent, setEditContent] = useState(content);
  const [editMediaUrl, setEditMediaUrl] = useState(mediaUrl || "");

  const avatar = authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

  const renderMediaContent = (mediaUrlStr: string) => {
    let urls: string[] = [];
    try {
      if (mediaUrlStr.trim().startsWith("[")) {
        const parsed = JSON.parse(mediaUrlStr);
        urls = Array.isArray(parsed) ? parsed : [mediaUrlStr];
      } else {
        urls = [mediaUrlStr];
      }
    } catch {
      urls = [mediaUrlStr];
    }

    return (
      <div className={`w-full grid gap-2 p-2 bg-slate-900/40 rounded-2xl ${urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {urls.map((url, idx) => {
          const isVideo = url.startsWith("data:video/") || url.endsWith(".mp4") || url.endsWith(".webm");
          const isPdf = url.startsWith("data:application/pdf") || url.endsWith(".pdf");

          if (isVideo) {
            return (
              <video
                key={idx}
                src={url}
                controls
                muted
                playsInline
                preload="metadata"
                className="w-full max-h-105 rounded-xl bg-black object-cover"
              />
            );
          }

          if (isPdf) {
            return (
              <div key={idx} className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Documento Anexo (PDF)</p>
                    <p className="text-[10px] text-slate-400">Clique para baixar / visualizar</p>
                  </div>
                </div>
                <a
                  href={url}
                  download="documento_aletis.pdf"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Baixar
                </a>
              </div>
            );
          }

          return (
            <img
              key={idx}
              src={url}
              alt="Mídia"
              className="w-full h-auto max-h-105 object-cover rounded-xl block"
              loading="lazy"
            />
          );
        })}
      </div>
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("content", editContent.trim());
      if (editMediaUrl.trim()) formData.append("mediaUrl", editMediaUrl.trim());

      const { updatePostAction } = await import("@/app/actions/post-actions");
      const res = await updatePostAction(id, formData);
      if (res.success) {
        setShowEditModal(false);
        if (onUpdated) onUpdated();
      } else {
        alert(res.message || "Erro ao editar post.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar edição.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <>
      <article
        onClick={onClick}
        className={cn(
          "group w-full overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700",
          "shadow-md mb-4 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/60",
          onClick && "cursor-pointer"
        )}
      >
        <div className="relative flex flex-col">
          {/* Badge Fixado */}
          {isPinned && (
            <div className="absolute -top-px -left-px z-20 bg-gold-400 text-slate-900 px-3 py-1 rounded-br-xl flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
              <Pin size={10} fill="currentColor" /> Fixado
            </div>
          )}

          {/* Mídia */}
          {mediaUrl && (
            <div className="w-full bg-black/20 overflow-hidden relative">
              {renderMediaContent(mediaUrl)}
              <div className="absolute top-2 right-2 flex gap-2 z-20">
                {canEdit && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                    className="bg-black/70 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-all"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                    className="bg-black/70 hover:bg-red-600 text-white px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-all"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="p-4">
            {/* Autor */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={avatar}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover border border-slate-600 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-100 truncate">{authorName}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comunidade</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                {canPin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPin) onPin();
                    }}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isPinned
                        ? "text-gold-400 bg-gold-400/20 border-gold-400/30"
                        : "text-slate-400 hover:text-gold-400 bg-slate-800/60 hover:bg-gold-400/10 border-slate-700"
                    }`}
                    title={isPinned ? "Desafixar aviso" : "Fixar aviso"}
                  >
                    <Pin size={13} fill={isPinned ? "currentColor" : "none"} />
                    <span>{isPinned ? "Fixado" : "Fixar"}</span>
                  </button>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit();
                      else setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-all cursor-pointer"
                    title="Editar Aviso"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/30 transition-all cursor-pointer"
                    title="Excluir Vibe"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="text-slate-200 text-sm md:text-base leading-relaxed mb-3 text-justify space-y-3 font-medium">
              {content.split(/\n+/).map((para, idx) => (
                <p key={idx} className="text-justify leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                    className="text-[10px] font-bold text-mint-500 bg-mint-500/10 px-2 py-0.5 rounded uppercase hover:bg-mint-500/20 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <div onClick={(e) => e.stopPropagation()}>
                <VibeZapButton
                  postId={id}
                  recipientUserId={authorId}
                  initialVibes={totalVibesReceived}
                  initialUserHasVibed={!!userHasLiked}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                  className={cn(
                    "flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-slate-700/50",
                    showComments ? "text-mint-500" : "text-slate-500 hover:text-white"
                  )}
                >
                  <MessageCircle size={20} />
                  {totalComments > 0 && (
                    <span className="text-xs font-bold">{totalComments}</span>
                  )}
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Seção de Comentários Reutilizável */}
            {showComments && (
              <div onClick={(e) => e.stopPropagation()} className="mt-3">
                <CommentSection postId={id} />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Modal de Deleção */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-100 mb-2">Excluir Vibe?</h3>
              <p className="text-slate-400 text-sm mb-6">Esta ação removerá o post permanentemente do feed.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold font-display text-white">Editar Publicação</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-mint-500 min-h-25 resize-none"
              placeholder="Digite o novo conteúdo..."
            />
            <input
              type="text"
              value={editMediaUrl}
              onChange={(e) => setEditMediaUrl(e.target.value)}
              placeholder="URL da imagem (opcional)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-mint-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="flex-1 py-2.5 rounded-xl bg-mint-500 text-slate-950 font-bold text-xs hover:bg-mint-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
