"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Share2,
  Trash2,
  Edit2,
  Pin,
  AlertTriangle,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Avatar } from "../atoms/Avatar";
import { VibeZapButton } from "./VibeZapButton";
import { CommentSection } from "./CommentSection";

export interface PostCardProps {
  id: string;
  authorId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  mediaUrl?: string | null;
  tags?: string[];
  totalVibesReceived: number;
  totalComments: number;
  userHasLiked?: boolean;
  isPinned?: boolean;
  createdAt?: string;
  isAuthorAnonymous?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onVibeClick?: () => void;
  onTagClick?: (tag: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  authorId,
  authorName,
  authorAvatar,
  content,
  mediaUrl,
  tags = [],
  totalVibesReceived,
  totalComments,
  userHasLiked = false,
  isPinned = false,
  isAuthorAnonymous = false,
  canEdit,
  canDelete,
  onVibeClick,
  onTagClick,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentsCount, setCommentsCount] = useState(totalComments);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const displayName = isAuthorAnonymous ? "Anônimo" : authorName || "Membro";
  const displayAvatar = isAuthorAnonymous ? null : authorAvatar;

  return (
    <>
      <div
        onClick={onClick}
        className={`mx-auto w-full overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700 shadow-md mb-5 transition-all hover:border-slate-600 group ${onClick ? "cursor-pointer" : ""
          }`}
      >
        <div className="flex flex-col relative">
          {/* Badge de Post Fixado */}
          {isPinned && (
            <div className="absolute top-0 left-0 z-20 bg-[#FFC300] text-[#1e293b] px-3 py-1 rounded-br-xl shadow-md flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest">
              <Pin size={12} fill="currentColor" /> Fixado
            </div>
          )}

          {/* Mídia da Vibe */}
          {mediaUrl && (
            <div className="w-full bg-black/20 overflow-hidden relative">
              <img
                src={mediaUrl}
                alt="Vibe"
                loading="lazy"
                className="w-full h-auto max-h-112.5 object-cover block"
              />
            </div>
          )}

          <div className="p-4 md:p-5">
            {/* Header: Autor + Menu de Ações */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar src={displayAvatar} alt={displayName} size="md" />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-100 truncate">
                    {displayName}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Aletis
                  </p>
                </div>
              </div>

              {/* Menu de Opções (Editar / Excluir) */}
              {(canEdit || canDelete) && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            onEdit?.();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Edit2 size={14} className="text-[#50c878]" /> Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conteúdo da Vibe */}
            <div className="text-slate-200 text-sm md:text-base leading-relaxed mb-4 text-justify space-y-3 font-medium">
              {content.split(/\n+/).map((para, idx) => (
                <p key={idx} className="text-justify leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className="text-[10px] font-bold text-[#50c878] bg-[#50c878]/10 hover:bg-[#50c878]/20 px-2.5 py-0.5 rounded-full uppercase transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Bar de Interações (Vibe, Comentários, Compartilhar) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <div onClick={(e) => e.stopPropagation()}>
                <VibeZapButton
                  postId={id}
                  recipientUserId={authorId || undefined}
                  initialVibes={totalVibesReceived}
                  initialUserHasVibed={userHasLiked}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComments(!showComments);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${showComments
                      ? "text-[#50c878] bg-[#50c878]/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                >
                  <MessageCircle size={16} />
                  <span>{commentsCount}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
                  title="Compartilhar"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Bloco Único de Comentários Reutilizável */}
            {showComments && (
              <CommentSection
                postId={id}
                onCommentsCountChange={(count) => setCommentsCount(count)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-1">
                Excluir Vibe?
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Esta ação removerá a mensagem permanentemente da comunidade.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
