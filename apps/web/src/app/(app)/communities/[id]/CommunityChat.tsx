"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Trash2,
  ExternalLink,
  Paperclip,
  Pin,
  Star,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { VibeZapButton } from "@/components/molecules";
import {
  getMessagesAction,
  sendMessageAction,
  updateMessageAction,
  deleteMessageAction,
  togglePinMessageAction,
  toggleHighlightMessageAction,
} from "@/app/actions/community-actions";
import { Channel, CommunityMessage } from "@aletis/domain";


interface CommunityChatProps {
  communityId: string;
  channel: Channel;
  isMember: boolean;
  currentUserProfile: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  canModeratorDelete?: boolean;
  onVibeUpdate?: (newBalance: number) => void;
  onMemberClick?: (userId: string, userName: string, avatarUrl: string) => void;
  userPermissions?: {
    allowText?: boolean;
    allowLinks?: boolean;
    allowVideos?: boolean;
    allowPhotos?: boolean;
  };
}

const parseTextWithLinks = (text: string, onLinkClick: (url: string) => void) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <button
          key={index}
          onClick={() => onLinkClick(part)}
          className="text-mint-400 font-medium underline hover:text-mint-300 text-left break-all transition-colors"
        >
          {part}
        </button>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const ExternalLinkWarningModal: React.FC<{
  url: string;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ url, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-200 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
    <div className="bg-[#1e293b] max-w-sm w-full rounded-2xl border border-yellow-500/50 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 border border-yellow-500/30">
          <ExternalLink size={24} />
        </div>
        <h3 className="text-lg font-bold text-white font-display">
          Você está saindo do Aletis
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          O link abaixo levará você para um site externo. Tenha cuidado com seus dados pessoais.
        </p>
        <div className="bg-slate-900 p-2.5 rounded-xl w-full break-all text-xs text-slate-400 font-mono border border-slate-800">
          {url}
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors cursor-pointer shadow-md"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function CommunityChat({
  communityId,
  channel,
  isMember,
  currentUserProfile,
  canModeratorDelete = false,
  onMemberClick,
  userPermissions,
}: CommunityChatProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [linkToOpen, setLinkToOpen] = useState<string | null>(null);

  const [messageToDelete, setMessageToDelete] = useState<CommunityMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleStartEdit = (msg: CommunityMessage) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await updateMessageAction(communityId, channel.id, messageId, editContent.trim());
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: editContent.trim() } : m))
        );
        setEditingMessageId(null);
        setEditContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getMessagesAction(channel.id);
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [channel.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !mediaUrl) return;
    if (!isMember) return;

    if (userPermissions?.allowText === false && !mediaUrl) {
      alert("Você não tem permissão para enviar mensagens de texto neste grupo.");
      return;
    }

    if (userPermissions?.allowPhotos === false && mediaUrl) {
      alert("Você não tem permissão para enviar imagens neste grupo.");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendMessageAction(channel.id, content, mediaUrl || undefined);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setContent("");
        setMediaUrl("");
      } else {
        alert(res.message || "Erro ao enviar mensagem.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTogglePin = async (message: CommunityMessage) => {
    const res = await togglePinMessageAction(communityId, channel.id, message.id);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, isPinned: !m.isPinned } : m))
      );
    }
  };

  const handleToggleHighlight = async (message: CommunityMessage) => {
    const res = await toggleHighlightMessageAction(communityId, channel.id, message.id);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, isHighlighted: !m.isHighlighted } : m
        )
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Erro ao carregar imagem:", err);
      setIsUploadingImage(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteMessageAction(channel.id, messageToDelete.id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      } else {
        alert(res.message || "Erro ao excluir mensagem.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir mensagem.");
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  const confirmLinkOpen = () => {
    if (linkToOpen) {
      window.open(linkToOpen, "_blank", "noopener,noreferrer");
      setLinkToOpen(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background relative">
      {linkToOpen && (
        <ExternalLinkWarningModal
          url={linkToOpen}
          onClose={() => setLinkToOpen(null)}
          onConfirm={confirmLinkOpen}
        />
      )}

      {messageToDelete && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setMessageToDelete(null)}
        >
          <div
            className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <Trash2 size={24} className="text-red-400" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1 font-display">
                Apagar mensagem?
              </h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setMessageToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteMessage}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Apagar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {messages.some((m) => m.isPinned) && (
        <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 px-4 flex items-center justify-between gap-3 text-xs shrink-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-mint-400 overflow-hidden">
            <Pin size={14} className="shrink-0 fill-mint-500/20" />
            <span className="font-bold shrink-0">Fixada:</span>
            <span className="text-slate-300 truncate">
              {messages.find((m) => m.isPinned)?.content}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <Loader2 className="animate-spin text-mint-500" size={32} />
            <span className="text-xs font-semibold">Carregando conversas...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
            <p className="text-sm font-semibold mb-1">Este canal está silencioso.</p>
            <p className="text-xs text-slate-600">Seja o primeiro a enviar uma mensagem acolhedora!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUserProfile?.id;
              const canDeleteThis = isOwnMessage || canModeratorDelete;

              return (
                <div
                  key={message.id}
                  className={`group flex gap-3 max-w-[85%] ${isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                >
                  <button
                    onClick={() =>
                      onMemberClick?.(message.userId, message.userName, message.userAvatar)
                    }
                    className="shrink-0 focus:outline-none cursor-pointer"
                    title={`Ver perfil de ${message.userName}`}
                  >
                    <img
                      src={message.userAvatar || "https://api.dicebear.com/7.x/avataaars/svg"}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-800 hover:border-mint-500 transition-colors"
                      alt=""
                    />
                  </button>
                  <div className="space-y-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onMemberClick?.(message.userId, message.userName, message.userAvatar)
                        }
                        className="text-xs font-bold text-slate-300 hover:text-mint-400 truncate cursor-pointer text-left transition-colors"
                      >
                        {message.userName}
                      </button>
                      <span className="text-[9px] text-slate-500 shrink-0">
                        {message.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${message.isHighlighted
                        ? "bg-yellow-500/10 border border-yellow-500/40 text-slate-100 shadow-md"
                        : isOwnMessage
                          ? "bg-mint-500/10 border border-mint-500/20 text-slate-100 rounded-tr-none"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                        }`}
                    >
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-slate-950 border border-mint-500/50 rounded-xl p-2 text-xs text-white focus:outline-none resize-none font-medium"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(message.id)}
                              disabled={isSavingEdit}
                              className="px-2.5 py-1 text-[10px] font-bold text-slate-950 bg-mint-400 hover:bg-mint-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isSavingEdit ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              <span>Salvar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {message.mediaUrl && (
                            <img
                              src={message.mediaUrl}
                              alt="Mídia"
                              className="max-w-xs rounded-xl mb-2 object-cover max-h-52 border border-slate-800 shadow-md"
                            />
                          )}
                          <p className="whitespace-pre-wrap wrap-break-word">
                            {parseTextWithLinks(message.content, (url) => setLinkToOpen(url))}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Botões de Ação na mensagem ao passar o mouse */}
                    <div
                      className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {isOwnMessage && editingMessageId !== message.id && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(message)}
                          className="text-slate-500 hover:text-mint-400 p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                          title="Editar mensagem"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      {canDeleteThis && (
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(message)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                          title="Excluir mensagem"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {isMember ? (
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2.5 items-end shrink-0 z-10"
        >
          <div className="flex-1 bg-slate-900 border border-slate-700 focus-within:border-mint-500 rounded-2xl flex flex-col p-2 transition-colors shadow-inner">
            <div className="flex items-center px-2 gap-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 resize-none max-h-24 h-9 py-1.5 custom-scrollbar font-medium"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <Loader2 size={18} className="animate-spin text-mint-400" />
                ) : (
                  <Paperclip size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending || (!content.trim() && !mediaUrl)}
            className="bg-mint-500 hover:bg-mint-600 text-slate-900 p-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      ) : (
        <div className="p-4 border-t border-slate-800 bg-slate-900/20 text-center text-slate-500 text-xs font-semibold shrink-0">
          Você está visualizando no modo leitura.
        </div>
      )}
    </div>
  );
}
