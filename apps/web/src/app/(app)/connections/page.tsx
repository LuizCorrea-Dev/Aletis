"use client";

import React, { useRef, useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  UserCheck,
  UserPlus,
  Send,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Users,
  Star,
  Shield,
  Check,
  Clock,
  CheckCheck,
  UserX,
  HeartHandshake,
  FileText,
  X,
} from "lucide-react";
import {
  useConnectionsViewModel,
  ConnectionsTab,
} from "@/view-models/useConnectionsViewModel";

function ConnectionsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ConnectionsTab) || "friends";
  const initialUser = searchParams.get("user") || null;

  const vm = useConnectionsViewModel({ initialTab, initialUser });
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto Scroll para final do chat quando novas mensagens chegam
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [vm.messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      vm.uploadMedia(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="w-full h-[calc(100vh-100px)] max-w-6xl mx-auto flex rounded-3xl overflow-hidden border border-slate-800 bg-[#1e293b] shadow-2xl">
      {/* SIDEBAR DE CONEXÕES */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-slate-900/80 border-r border-slate-800 backdrop-blur-md flex flex-col ${
          vm.activeChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-800 space-y-4">
          <h2 className="text-xl font-extrabold text-white font-display">Conexões</h2>

          {/* Abas Amigos, DMs e Favoritos ⭐ */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => vm.setActiveTab("friends")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                vm.activeTab === "friends"
                  ? "bg-[#50c878] text-[#1e293b] shadow-lg font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Amigos ({vm.friendsCount})
            </button>

            <button
              type="button"
              onClick={() => vm.setActiveTab("dms")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer relative ${
                vm.activeTab === "dms"
                  ? "bg-[#50c878] text-[#1e293b] shadow-lg font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              DMs
              {vm.totalUnreadDMs > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => vm.setActiveTab("favorites")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                vm.activeTab === "favorites"
                  ? "bg-[#FFC300] text-[#1e293b] shadow-lg font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Star size={12} fill="currentColor" /> ({vm.favoritesCount})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder={
                vm.activeTab === "friends"
                  ? "Buscar amigos..."
                  : vm.activeTab === "favorites"
                  ? "Buscar favoritos..."
                  : "Buscar DMs..."
              }
              value={vm.searchTerm}
              onChange={(e) => vm.setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#50c878] transition-colors"
            />
          </div>
        </div>

        {/* LISTA DE CONVERSAS / CONEXÕES */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {vm.isLoadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#50c878]" size={24} />
            </div>
          ) : vm.displayedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium px-4">
              {vm.activeTab === "friends"
                ? "Nenhum amigo encontrado."
                : vm.activeTab === "favorites"
                ? "Nenhum amigo marcado como favorito ⭐."
                : "Nenhuma conversa DM de não-amigos."}
            </div>
          ) : (
            vm.displayedList.map((item) => (
              <div
                key={item.id}
                onClick={() => vm.setActiveChat(item)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                  vm.activeChat?.id === item.id
                    ? "bg-slate-800 text-white border-l-4 border-l-[#50c878]"
                    : "hover:bg-slate-800/50 text-slate-300 border-l-4 border-l-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover bg-slate-800 border border-slate-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] ${
                      item.status === "online" ? "bg-[#50c878]" : "bg-slate-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-bold text-xs truncate text-white flex items-center gap-1">
                      {item.name}
                      {item.isCloseFriend && (
                        <Star size={12} className="text-[#FFC300] fill-[#FFC300]" />
                      )}
                    </h4>
                    {item.lastMessageTime && (
                      <span className="text-[10px] text-slate-500">{item.lastMessageTime}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-slate-400 truncate max-w-42.5">
                      {item.lastMessage || "Clique para conversar"}
                    </p>
                    {item.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO CHAT */}
      <div
        className={`flex-1 flex flex-col bg-[#1e293b] relative ${
          !vm.activeChat ? "hidden md:flex" : "flex"
        }`}
      >
        {vm.activeChat ? (
          <>
            {/* Header do Chat */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/90 shrink-0 backdrop-blur">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => vm.setActiveChat(null)}
                  className="md:hidden text-slate-400 hover:text-white p-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <img
                  src={vm.activeChat.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${vm.activeChat.name}`}
                  alt={vm.activeChat.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-white font-display flex items-center gap-1.5">
                    {vm.activeChat.name}
                    {vm.activeChat.isCloseFriend && (
                      <Star size={14} className="text-[#FFC300] fill-[#FFC300]" />
                    )}
                  </h3>
                  <span className="text-[10px] text-[#50c878] font-bold">
                    {vm.activeChat.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Ações de Relacionamento (Seguir + Favorito ⭐ + Amizade) */}
              <div className="flex items-center gap-2">
                {/* Botão Alternar Favorito CRUD ⭐ */}
                {vm.activeChat.friendshipStatus === "accepted" && (
                  <button
                    type="button"
                    onClick={() => vm.toggleFavoriteFriend()}
                    disabled={vm.actionLoading === "favorite"}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      vm.activeChat.isCloseFriend
                        ? "bg-[#FFC300]/15 border-[#FFC300]/40 text-[#FFC300]"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title={vm.activeChat.isCloseFriend ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                  >
                    <Star
                      size={16}
                      fill={vm.activeChat.isCloseFriend ? "currentColor" : "none"}
                    />
                  </button>
                )}

                {/* Botão Seguir / Seguindo */}
                <button
                  type="button"
                  onClick={vm.toggleFollow}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    vm.activeChat.isFollowing
                      ? "bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  {vm.activeChat.isFollowing ? "Seguindo" : "+ Seguir"}
                </button>

                {/* Botão Status de Amizade */}
                {vm.activeChat.friendshipStatus === "accepted" ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowFriendMenu(!showFriendMenu)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#50c878]/15 border border-[#50c878]/30 text-[#50c878] flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck size={14} /> Amigos
                    </button>
                    {showFriendMenu && (
                      <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            vm.removeFriendship();
                            setShowFriendMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <UserX size={14} /> Desfazer Amizade
                        </button>
                      </div>
                    )}
                  </div>
                ) : vm.activeChat.friendshipStatus === "pending_sent" ? (
                  <span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                    Solicitação Enviada
                  </span>
                ) : vm.activeChat.friendshipStatus === "pending_received" ? (
                  <button
                    type="button"
                    onClick={vm.acceptFriendship}
                    disabled={vm.actionLoading === "friend"}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#50c878] text-[#1e293b] hover:bg-[#50c878]/90 flex items-center gap-1 cursor-pointer"
                  >
                    {vm.actionLoading === "friend" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <HeartHandshake size={14} /> Aceitar Amizade
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={vm.requestFriendship}
                    disabled={vm.actionLoading === "friend"}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer"
                  >
                    {vm.actionLoading === "friend" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={14} /> Add Amigo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* LISTA DE MENSAGENS */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-950/40">
              {vm.isLoadingMessages ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="animate-spin text-[#50c878]" size={24} />
                </div>
              ) : vm.messages.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Inicie uma conversa respeitosa com {vm.activeChat.name}.
                </div>
              ) : (
                vm.messages.map((msg) => {
                  const isMe = msg.senderId === vm.currentUserId;

                  let inviteData = null;
                  if (msg.type === "promotion_request") {
                    try {
                      inviteData = JSON.parse(msg.content);
                    } catch (e) {
                      inviteData = { text: msg.content };
                    }
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[65%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                          isMe
                            ? "bg-[#50c878] text-[#1e293b] font-medium rounded-tr-none"
                            : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                        }`}
                      >
                        {/* Imagem / Vídeo / Documento PDF */}
                        {msg.mediaUrl && (
                          msg.type === "video" || msg.mediaUrl.startsWith("data:video/") || msg.mediaUrl.endsWith(".mp4") || msg.mediaUrl.endsWith(".webm") ? (
                            <video
                              src={msg.mediaUrl}
                              controls
                              muted
                              playsInline
                              preload="metadata"
                              className="rounded-xl mb-2 max-h-60 w-full object-cover bg-black"
                            />
                          ) : msg.mediaUrl.startsWith("data:application/pdf") || msg.mediaUrl.endsWith(".pdf") ? (
                            <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center justify-between gap-3 mb-2 text-white">
                              <div className="flex items-center gap-2">
                                <FileText size={20} className="text-amber-400" />
                                <span className="text-xs font-bold truncate max-w-36">{msg.content || "Documento PDF"}</span>
                              </div>
                              <a
                                href={msg.mediaUrl}
                                download="documento.pdf"
                                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold cursor-pointer shrink-0"
                              >
                                Baixar
                              </a>
                            </div>
                          ) : (
                            <img
                              src={msg.mediaUrl}
                              alt="Mídia"
                              className="rounded-xl mb-2 max-h-60 w-full object-cover"
                            />
                          )
                        )}

                        {/* Texto Padrão */}
                        {msg.type !== "promotion_request" && (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}

                        {/* Convite de Grupo / Cargo */}
                        {msg.type === "promotion_request" && inviteData && (
                          <div
                            className={`rounded-xl p-3 border ${
                              isMe
                                ? "bg-black/10 border-white/20"
                                : "bg-slate-900/60 border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wide text-amber-400">
                              <Shield size={16} /> Convite Oficial de Grupo
                            </div>
                            <p className="text-sm mb-3 font-medium">{inviteData.text}</p>
                            {!isMe ? (
                              <button
                                type="button"
                                onClick={() => alert("Convite de grupo aceito!")}
                                className="w-full py-2 bg-[#50c878] text-[#1e293b] rounded-lg font-bold text-xs hover:bg-[#50c878]/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Check size={14} /> Aceitar Cargo / Grupo
                              </button>
                            ) : (
                              <div className="text-center text-[11px] opacity-80 italic flex items-center justify-center gap-1">
                                <Clock size={12} /> Aguardando resposta...
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-bold ${
                            isMe ? "opacity-75" : "text-slate-400"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Banner de Erro de Arquivo */}
            {vm.fileError && (
              <div className="mx-4 mb-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300 font-medium animate-in fade-in">
                <span>{vm.fileError}</span>
                <button
                  type="button"
                  onClick={() => vm.setFileError(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Form de Envio de Mensagem */}
            <div className="p-3 md:p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
              <form onSubmit={vm.sendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={vm.isUploading}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  title="Enviar Foto (15MB), Vídeo (150MB) ou PDF (25MB)"
                >
                  {vm.isUploading ? (
                    <Loader2 size={18} className="animate-spin text-[#50c878]" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,video/mp4,video/webm,application/pdf"
                />

                <input
                  type="text"
                  value={vm.inputText}
                  onChange={(e) => vm.setInputText(e.target.value)}
                  placeholder={`Digite sua mensagem para ${vm.activeChat.name}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#50c878] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!vm.inputText.trim()}
                  className="p-3 bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] rounded-2xl transition-all disabled:opacity-50 cursor-pointer font-bold"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <div className="w-16 h-16 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-center mb-3">
              <Users size={28} className="text-slate-500" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1 font-display">
              Suas Conexões
            </h3>
            <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
              Selecione uma pessoa da lista ao lado para iniciar uma conversa acolhedora.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <Loader2 className="animate-spin text-[#50c878]" size={32} />
        </div>
      }
    >
      <ConnectionsPageContent />
    </Suspense>
  );
}
