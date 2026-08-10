"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Trash2,
  Loader2,
  ShieldAlert,
  X,
  CornerDownRight,
  Sparkles,
} from "lucide-react";
import { Avatar } from "../atoms/Avatar";
import { VibeZapButton } from "./VibeZapButton";
import {
  getCommentsAction,
  createCommentAction,
  deleteCommentAction,
  CommentItem,
} from "@/app/actions/post-actions";

export interface CommentSectionProps {
  postId?: string;
  atrioId?: string;
  authorId?: string;
  onCommentsCountChange?: (count: number) => void;
  className?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  atrioId,
  authorId,
  onCommentsCountChange,
  className = "",
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [sentinelaError, setSentinelaError] = useState<string | null>(null);
  const [readabilityBonusNotice, setReadabilityBonusNotice] = useState<boolean>(false);
  const [inTimeoutNotice, setInTimeoutNotice] = useState<string | null>(null);

  const minChars = 100;
  const progress = Math.min((newComment.length / minChars) * 100, 100);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getCommentsAction({ postId, atrioId });
      setComments(data);
      onCommentsCountChange?.(data.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId, atrioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.length < minChars || isSubmitting) return;

    setIsSubmitting(true);
    setSentinelaError(null);
    setReadabilityBonusNotice(false);
    setInTimeoutNotice(null);

    try {
      const res = await createCommentAction({
        postId,
        atrioId,
        parentId: replyingTo?.id,
        recipientUserId: replyingTo?.userId || authorId,
        content: newComment,
      });

      if (res.success && res.data) {
        const updated = [...comments, res.data];
        setComments(updated);
        setNewComment("");
        setReplyingTo(null);
        onCommentsCountChange?.(updated.length);

        if (res.readabilityBonusApplied) {
          setReadabilityBonusNotice(true);
          setTimeout(() => setReadabilityBonusNotice(false), 5000);
        }

        // Notificar o Header caso o saldo tenha mudado pela doação do comentário
        if (res.newBalance !== undefined && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vibe-updated", { detail: { newBalance: res.newBalance } })
          );
        }
      } else if (res.inTimeout) {
        setInTimeoutNotice(
          res.message || "Sua conta está em Time-Out. Publique um desabafo no feed para recuperar apoio e VIBES."
        );
      } else if (res.sentinelaBlocked) {
        setSentinelaError(res.message || "O Sentinela bloqueou seu comentário.");
      } else {
        setSentinelaError(res.message || "Não foi possível publicar seu comentário.");
      }
    } catch (err: any) {
      setSentinelaError("Erro ao processar comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await deleteCommentAction(commentId);
      if (res.success) {
        const updated = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
        setComments(updated);
        onCommentsCountChange?.(updated.length);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Renderização Recursiva para Respostas Aninhadas
  const renderComment = (comment: CommentItem, isReply = false) => {
    const replies = comments.filter((c) => c.parentId === comment.id);

    return (
      <div
        key={comment.id}
        className={`${isReply ? "ml-6 mt-2.5 border-l-2 border-slate-700/50 pl-3" : "mt-3"}`}
      >
        <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 group hover:border-slate-700 transition-colors">
          <Avatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#50c878] truncate">
                  {comment.authorName}
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  {comment.createdAt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Botão Vibe Zap no Comentário */}
                <VibeZapButton
                  commentId={comment.id}
                  recipientUserId={comment.userId}
                  initialVibes={comment.vibesCount}
                  initialUserHasVibed={comment.userHasVibed}
                  size="sm"
                />

                {/* Botão Excluir Comentário */}
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                  title="Excluir comentário"
                >
                  {deletingId === comment.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed wrap-break-word font-medium text-justify">
              {comment.content}
            </p>

            <button
              type="button"
              onClick={() => setReplyingTo(comment)}
              className="mt-2 text-[10px] font-bold text-slate-400 hover:text-[#50c878] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CornerDownRight size={11} /> RESPONDER
            </button>

            {/* Respostas Aninhadas */}
            {replies.map((r) => renderComment(r, true))}
          </div>
        </div>
      </div>
    );
  };

  const rootComments = comments.filter((c) => !c.parentId);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mt-3 space-y-4 animate-in fade-in duration-200 ${className}`}
    >
      {/* Header com Regra da Vibe (Soma Zero) e Total de Comentários */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-2 font-display uppercase tracking-wider">
          <MessageSquare size={14} className="text-[#50c878]" /> Discussão (
          {comments.length})
        </h4>
        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border border-slate-700 flex items-center gap-1">
          <Sparkles size={10} className="text-[#50c878]" /> 2 VIBES (SOMA ZERO)
        </span>
      </div>

      {/* Alerta de Bônus de Legibilidade Concedido */}
      {readabilityBonusNotice && (
        <div className="bg-[#50c878]/10 border border-[#50c878]/30 rounded-xl p-3 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <Sparkles size={18} className="text-[#50c878] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-[#50c878]">Bônus de Legibilidade (+1 VIBE)</h5>
            <p className="text-slate-200 leading-relaxed mt-0.5">
              Parabéns! Sua resposta bem estruturada em parágrafos recebeu um reembolso de +1 VIBE.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de Estado em Time-Out */}
      {inTimeoutNotice && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-red-300">Modo Time-Out Ativo</h5>
            <p className="text-red-200/90 leading-relaxed mt-0.5">{inTimeoutNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setInTimeoutNotice(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Alerta de Moderação da IA Sentinela */}
      {sentinelaError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-red-300">Guardião Sentinela</h5>
            <p className="text-red-200/90 leading-relaxed mt-0.5">{sentinelaError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSentinelaError(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Lista de Comentários */}
      {isLoading ? (
        <div className="flex justify-center items-center py-6 text-slate-400">
          <Loader2 className="animate-spin text-[#50c878]" size={18} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-4 text-xs text-slate-500 font-medium">
          Nenhum comentário ainda. Seja o primeiro a adicionar valor à conversa!
        </p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {rootComments.map((c) => renderComment(c))}
        </div>
      )}

      {/* Formulário Fixado no Rodapé do Bloco */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        {/* Indicador de Resposta a um Usuário */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 text-[10px] text-slate-300 rounded-t-xl border-x border-t border-slate-700">
            <span>
              Respondendo a <strong className="text-[#50c878]">{replyingTo.authorName}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-0.5 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="bg-slate-950/60 rounded-xl border border-slate-700 focus-within:border-[#50c878]/50 transition-colors overflow-hidden relative">
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (sentinelaError) setSentinelaError(null);
              }}
              placeholder={
                replyingTo
                  ? "Sua resposta com profundidade (mínimo 100 caracteres)..."
                  : "Adicione valor à conversa (mínimo 100 caracteres)..."
              }
              disabled={isSubmitting}
              className="w-full bg-transparent text-slate-200 text-xs p-3.5 min-h-16 max-h-30 outline-none resize-none placeholder-slate-500 font-medium"
              rows={2}
            />

            {/* Barra de Progresso Visual de 100 Caracteres (Integrada ao Input) */}
            <div className="w-full h-1.5 bg-slate-800/90 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  newComment.length >= minChars
                    ? "bg-[#50c878] shadow-[0_0_10px_#50c878]"
                    : "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold px-1">
            <span
              className={
                newComment.length >= minChars
                  ? "text-[#50c878] uppercase tracking-wider font-extrabold"
                  : "text-amber-400/90 uppercase tracking-wider font-bold"
              }
            >
              {newComment.length < minChars
                ? `Faltam ${minChars - newComment.length} caracteres para o mínimo`
                : "✨ Mínimo atingido! Pronto para comentar."}
            </span>

            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                  newComment.length >= minChars
                    ? "text-[#50c878] bg-[#50c878]/10 border border-[#50c878]/30"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                }`}
              >
                {newComment.length}/{minChars} ({Math.round(progress)}%)
              </span>

              <button
                type="submit"
                disabled={newComment.length < minChars || isSubmitting}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  newComment.length >= minChars
                    ? "bg-[#50c878] hover:bg-[#43a060] text-slate-950 shadow-lg hover:shadow-[0_0_12px_rgba(80,200,120,0.4)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Send size={13} />
                    <span>Comentar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
