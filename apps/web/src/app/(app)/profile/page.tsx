"use client";

import React, { useState } from "react";
import {
  LogOut,
  Sparkles,
  LayoutGrid,
  Building2,
  Heart,
  Users,
  Plus,
  Settings,
  Zap,
  Anchor,
  ShieldCheck,
  MessageCircle,
  X,
  Edit3,
  Trash2,
  Crown,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Globe,
  Star,
  UserPlus,
  FolderHeart,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/view-models/useProfile";
import { Avatar } from "@/components/atoms/Avatar";
import { PostCard } from "@/components/features/PostCard";
import { ProfileSettingsModal } from "@/components/features/ProfileSettingsModal";
import { CreatePostModal } from "@/components/features/CreatePostModal";
import { EditPostModal } from "@/components/features/EditPostModal";
import { CreateAtrioModal } from "@/components/features/CreateAtrioModal";
import { EditAtrioModal } from "@/components/features/EditAtrioModal";
import { ShareListModal } from "@/components/features/ShareListModal";
import {
  AtrioItemData,
  AtrioListData,
  deleteAtrioListAction,
  setAtrioListCoverAction,
  getListAtrioItemsAction,
  createAtrioListAction,
} from "@/app/actions/atrio-actions";
import { deletePostAction } from "@/app/actions/post-actions";
import { deleteAtrioItemAction } from "@/app/actions/atrio-actions";
import { logoutAction } from "@/app/actions/user-actions";

export default function ProfilePage() {
  const {
    user,
    posts,
    atrioItems,
    atrioLists,
    userCommunities,
    allPostsCount,
    isLoading,
    activeTab,
    isSettingsOpen,
    isCreateOpen,
    editingPost,
    selectedPost,
    setActiveTab,
    setIsSettingsOpen,
    setIsCreateOpen,
    setEditingPost,
    setSelectedPost,
    reload,
  } = useProfile();

  const [isCreateAtrioOpen, setIsCreateAtrioOpen] = useState(false);
  const [editingAtrioItem, setEditingAtrioItem] = useState<AtrioItemData | null>(null);
  const [atrioSubTab, setAtrioSubTab] = useState<"obras" | "santuario">("obras");
  const [selectedList, setSelectedList] = useState<AtrioListData | null>(null);
  const [selectedListItems, setSelectedListItems] = useState<AtrioItemData[]>([]);
  const [isLoadingListItems, setIsLoadingListItems] = useState(false);
  const [sharingList, setSharingList] = useState<AtrioListData | null>(null);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListNameInput, setNewListNameInput] = useState("");

  const handleOpenList = async (list: AtrioListData) => {
    setSelectedList(list);
    setIsLoadingListItems(true);
    try {
      const items = await getListAtrioItemsAction(list.id);
      setSelectedListItems(items);
    } catch (err) {
      console.error("handleOpenList error:", err);
    } finally {
      setIsLoadingListItems(false);
    }
  };

  const handleSetListCover = async (listId: string, item: AtrioItemData) => {
    try {
      const res = await setAtrioListCoverAction(listId, item.id);
      if (res.success) {
        setSelectedList((prev) => (prev ? { ...prev, coverItemId: item.id, coverUrl: item.url } : null));
        reload();
      }
    } catch (err) {
      console.error("handleSetListCover error:", err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta lista do Santuário?")) return;
    try {
      const res = await deleteAtrioListAction(listId);
      if (res.success) {
        if (selectedList?.id === listId) setSelectedList(null);
        reload();
      }
    } catch (err) {
      console.error("handleDeleteList error:", err);
    }
  };

  const handleCreateListSubmit = async () => {
    if (!newListNameInput.trim()) return;
    try {
      const res = await createAtrioListAction(newListNameInput.trim());
      if (res.success) {
        setNewListNameInput("");
        setIsCreateListOpen(false);
        reload();
      }
    } catch (err) {
      console.error("handleCreateListSubmit error:", err);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Tem certeza que deseja excluir esta publicação?")) {
      const res = await deletePostAction(postId);
      if (res.success) {
        reload();
      }
    }
  };

  const handleDeleteAtrioItem = async (itemId: string) => {
    if (confirm("Tem certeza que deseja excluir esta obra do Átrio?")) {
      const res = await deleteAtrioItemAction(itemId);
      if (res.success) {
        reload();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500 font-medium">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm text-slate-400">Perfil não encontrado. Por favor, faça login novamente.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-28 overflow-x-hidden">
      {/* Header Profile Banner & Info */}
      <div className="bg-[#1e293b] rounded-3xl overflow-hidden border border-slate-700/80 mb-8 relative shadow-2xl">
        <div className="h-44 md:h-52 bg-slate-800 relative">
          <img
            src={user.bannerUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80"}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e293b]" />
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-black/40 hover:bg-[#50c878] text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all cursor-pointer"
              title="Configurações"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2.5 rounded-full backdrop-blur-md border border-red-500/30 transition-all cursor-pointer"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 md:px-8 relative -mt-16 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="border-4 border-[#1e293b] shadow-2xl"
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#50c878] border-4 border-[#1e293b] rounded-full" />
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-14">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2 font-display">
              {user.name}
              {user.tipoPerfil === "ancora" ? (
                <span className="text-[var(--tier-ancora-color)]" title="Membro Âncora">
                  <Anchor size={20} />
                </span>
              ) : user.tipoPerfil === "verificado" ? (
                <span className="text-[var(--tier-verificado-color)]" title="Profissional Verificado">
                  <ShieldCheck size={20} />
                </span>
              ) : (
                <span className="text-[var(--tier-comum-color)]" title="Membro Comum">
                  <Zap size={20} fill="currentColor" />
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-xs mb-1">@{user.username}</p>
            {user.status && (
              <p className="text-[#50c878] font-medium text-xs mb-1">{user.status}</p>
            )}
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed mx-auto md:mx-0 mt-1 font-medium">
              {user.bio}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setActiveTab("posts")}>
                <strong className="text-white text-sm">{allPostsCount}</strong> Publicações
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setActiveTab("following")}>
                <strong className="text-white text-sm">0</strong> Seguindo
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setActiveTab("connections")}>
                <strong className="text-white text-sm">0</strong> Conexões
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Abas idênticas ao web-legacy */}
      <div className="flex border-b border-slate-700/60 mb-6 overflow-x-auto custom-scrollbar gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${activeTab === "posts" || activeTab === "vibes"
              ? "border-[#50c878] text-[#50c878]"
              : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
          <LayoutGrid size={16} />
          <span>Posts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("atrio")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${activeTab === "atrio"
              ? "border-[#50c878] text-[#50c878]"
              : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
          <Sparkles size={16} />
          <span>Átrio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${activeTab === "groups"
              ? "border-[#50c878] text-[#50c878]"
              : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
          <Building2 size={16} />
          <span>Grupos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("following")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${activeTab === "following"
              ? "border-[#50c878] text-[#50c878]"
              : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
          <Heart size={16} />
          <span>Rede</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("connections")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${activeTab === "connections"
              ? "border-[#50c878] text-[#50c878]"
              : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
          <Users size={16} />
          <span>Conexões</span>
        </button>
      </div>

      {/* Conteúdo da Aba Posts */}
      {(activeTab === "posts" || activeTab === "vibes") && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* Card para Criar Novo Post */}
          <div
            onClick={() => setIsCreateOpen(true)}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-[#50c878] flex flex-col items-center justify-center cursor-pointer group bg-slate-800/20 transition-all hover:bg-slate-800/40 p-4 text-center"
          >
            <div className="p-3.5 rounded-full bg-slate-800 group-hover:bg-[#50c878]/20 text-slate-400 group-hover:text-[#50c878] transition-colors mb-2 shadow-md">
              <Plus size={28} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
              Novo Post
            </span>
          </div>

          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="aspect-square group relative overflow-hidden rounded-2xl bg-slate-800/60 border border-slate-700/60 cursor-pointer shadow-md"
            >
              {post.media_url ? (
                <img
                  src={post.media_url}
                  alt="Post"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full p-4 flex items-center justify-center text-center text-slate-400 text-xs bg-slate-900/80 leading-relaxed overflow-hidden">
                  {post.content.length > 80 ? `${post.content.slice(0, 80)}...` : post.content}
                </div>
              )}

              {/* Botões Flutuantes de Ação Rápida */}
              <div className="absolute top-2 right-2 flex gap-1.5 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPost(post);
                  }}
                  className="p-2 bg-black/70 hover:bg-blue-600 text-white rounded-full backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
                  title="Editar Vibe"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post.id);
                  }}
                  className="p-2 bg-black/70 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
                  title="Excluir Vibe"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs pointer-events-none">
                <span className="flex items-center gap-1">
                  <Zap size={14} fill="currentColor" /> {post.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} fill="currentColor" /> {post.comments_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo da Aba Átrio */}
      {activeTab === "atrio" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAtrioSubTab("obras");
                  setSelectedList(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${atrioSubTab === "obras"
                    ? "bg-[#2dd4bf] text-slate-950 shadow-md"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  }`}
              >
                <Sparkles size={14} />
                <span>Minhas Obras ({atrioItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAtrioSubTab("santuario");
                  setSelectedList(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${atrioSubTab === "santuario"
                    ? "bg-[#2dd4bf] text-slate-950 shadow-md"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  }`}
              >
                <FolderHeart size={14} />
                <span>Santuário ({atrioLists.length} listas)</span>
              </button>
            </div>

            {atrioSubTab === "obras" && (
              <button
                type="button"
                onClick={() => setIsCreateAtrioOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus size={14} /> Nova Obra
              </button>
            )}

            {atrioSubTab === "santuario" && !selectedList && (
              <button
                type="button"
                onClick={() => setIsCreateListOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus size={14} /> Nova Lista
              </button>
            )}
          </div>

          {atrioSubTab === "obras" && (
            <div className="space-y-4">
              {atrioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {atrioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-800/50 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-[#2dd4bf] transition-all group relative"
                    >
                      {item.url && (
                        <div className="h-48 overflow-hidden relative">
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] font-bold text-[#2dd4bf] bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 px-2 py-0.5 rounded-md">
                                #{t.replace(/^#/, "")}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-medium">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                          <span className="text-[10px] font-bold uppercase text-[#2dd4bf]">Átrio Contemplativo</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAtrioItem(item)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30 transition-all cursor-pointer"
                            >
                              <Edit3 size={12} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAtrioItem(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                  <p className="text-xs text-slate-400 font-medium mb-3">Você ainda não possui obras salvas na galeria do Átrio.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreateAtrioOpen(true)}
                    className="px-4 py-2 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Publicar Primeira Obra no Átrio
                  </button>
                </div>
              )}
            </div>
          )}

          {atrioSubTab === "santuario" && (
            <div className="space-y-4">
              {isCreateListOpen && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border border-[#2dd4bf]/40 space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FolderHeart size={15} className="text-[#2dd4bf]" /> Nova Lista de Favoritos do Santuário
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newListNameInput}
                      onChange={(e) => setNewListNameInput(e.target.value)}
                      placeholder="Nome da lista (ex: Minhas Inspirações, Paz Interior)..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateListSubmit}
                      disabled={!newListNameInput.trim()}
                      className="px-4 py-2 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Salvar Lista
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateListOpen(false)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {selectedList ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedList(null)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                      >
                        <ArrowLeft size={16} />
                        <span>Voltar às Listas</span>
                      </button>
                      <div>
                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                          {selectedList.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedListItems.length} obras salvas nesta lista
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSharingList(selectedList)}
                      className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      <span>Compartilhar Lista</span>
                    </button>
                  </div>

                  {isLoadingListItems ? (
                    <div className="py-12 text-center text-[#2dd4bf]">
                      <Loader2 size={24} className="animate-spin mx-auto" />
                    </div>
                  ) : selectedListItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedListItems.map((item) => {
                        const isCover = selectedList.coverItemId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`bg-slate-800/50 border rounded-2xl overflow-hidden transition-all group relative ${isCover ? "border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "border-slate-700/80 hover:border-[#2dd4bf]"
                              }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSetListCover(selectedList.id, item)}
                              className="absolute top-3 right-3 z-30 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-lg backdrop-blur-md"
                              title={isCover ? "Capa Atual da Lista" : "Clique para Definir como Capa da Lista"}
                            >
                              <Star
                                size={16}
                                fill={isCover ? "#EAB308" : "none"}
                                className={isCover ? "text-yellow-500" : "text-slate-400 group-hover:text-yellow-400"}
                              />
                              {isCover && <span className="text-[9px] font-extrabold text-yellow-400 uppercase tracking-wider pr-1">Capa</span>}
                            </button>

                            {item.url && (
                              <div
                                onClick={() => setSelectedPost({
                                  id: item.id,
                                  user_id: item.userId,
                                  content: item.description,
                                  media_url: item.url,
                                  tags: item.tags,
                                  likes_count: item.vibesCount,
                                })}
                                className="h-48 overflow-hidden relative cursor-pointer"
                              >
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            )}

                            <div className="p-4 space-y-2">
                              <h4 className="text-sm font-bold text-white">{item.title}</h4>
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                                <span>Por: {item.authorName}</span>
                                <span className="font-bold text-[#2dd4bf]">Santuário</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                      <p className="text-xs text-slate-400 font-medium mb-1">Esta lista de favoritos está vazia.</p>
                      <p className="text-[10px] text-slate-500">Navegue pelo Átrio e clique no ícone de Bookmark para guardar obras aqui.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {atrioLists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {atrioLists.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => handleOpenList(l)}
                          className="bg-slate-800/50 border border-slate-700/80 hover:border-[#2dd4bf] rounded-2xl overflow-hidden transition-all group relative cursor-pointer flex flex-col justify-between"
                        >
                          <div className="h-36 bg-slate-900 relative overflow-hidden">
                            {l.coverUrl ? (
                              <img src={l.coverUrl} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-slate-600">
                                <FolderHeart size={36} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />

                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <h4 className="text-base font-extrabold text-white group-hover:text-[#2dd4bf] transition-colors truncate">
                                {l.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40 shrink-0">
                                {l.itemsCount} itens
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900/60 border-t border-slate-700/60 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingList(l);
                              }}
                              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Compartilhar lista com amigos"
                            >
                              <UserPlus size={12} /> Compartilhar
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(l.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Excluir lista"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                      <p className="text-xs text-slate-400 font-medium mb-3">Sua galeria de favoritos do Santuário está vazia.</p>
                      <button
                        type="button"
                        onClick={() => setIsCreateListOpen(true)}
                        className="px-4 py-2 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Criar Primeira Lista de Favoritos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba Grupos / Comunidades */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Building2 size={18} className="text-[#50c878]" /> Grupos & Comunidades
            </h3>
            <div className="flex items-center gap-3">
              <Link
                href="/communities"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <span>Explorar Comunidades</span>
                <ArrowUpRight size={14} />
              </Link>
              <span className="text-xs text-slate-400 font-bold">{userCommunities.length} grupos</span>
            </div>
          </div>

          {userCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCommunities.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-slate-800/50 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-[#50c878] transition-all group relative flex flex-col justify-between"
                >
                  <div className="h-28 bg-slate-900 relative overflow-hidden">
                    {comm.bannerUrl ? (
                      <img src={comm.bannerUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                    {comm.isSuspended && (
                      <div className="absolute top-2 right-2 bg-red-950/90 text-red-300 border border-red-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <ShieldAlert size={12} /> PAUSADA
                      </div>
                    )}
                  </div>

                  <div className="p-4 relative -mt-10 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <img
                          src={comm.avatarUrl}
                          alt={comm.name}
                          className="w-14 h-14 rounded-2xl border-2 border-slate-800 object-cover bg-slate-900 shadow-lg"
                        />
                        <div className="flex items-center gap-1.5">
                          {comm.role === "OWNER" && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Crown size={12} /> DONO
                            </span>
                          )}
                          {comm.role === "MODERATOR" && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <ShieldCheck size={12} /> MODERADOR
                            </span>
                          )}
                          {comm.role === "MEMBER" && (
                            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Users size={12} /> MEMBRO
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-white group-hover:text-[#50c878] transition-colors flex items-center gap-2">
                          {comm.name}
                          {comm.privacy === "PRIVATE" ? (
                            <span title="Privada"><Lock size={12} className="text-slate-500" /></span>
                          ) : (
                            <span title="Pública"><Globe size={12} className="text-slate-500" /></span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1 font-medium">
                          {comm.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {comm.privacy === "PRIVATE" ? "Grupo Privado" : "Comunidade Pública"}
                      </span>
                      <Link
                        href={`/communities/${comm.id}`}
                        className="px-3 py-1.5 bg-[#50c878]/15 hover:bg-[#50c878] text-[#50c878] hover:text-slate-950 font-extrabold text-xs rounded-xl border border-[#50c878]/30 transition-all flex items-center gap-1"
                      >
                        Acessar Grupo <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <p className="text-xs text-slate-400 font-medium mb-3">Você ainda não faz parte de nenhum grupo ou comunidade.</p>
              <Link
                href="/communities"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#50c878] hover:bg-[#50c878]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Explorar Comunidades Aletis
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab !== "posts" && activeTab !== "vibes" && activeTab !== "atrio" && activeTab !== "groups" && (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <p className="text-xs text-slate-500 font-medium">Nenhum item nesta aba ainda.</p>
        </div>
      )}

      {/* Modais */}
      {isSettingsOpen && (
        <ProfileSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={{
            id: user.id,
            name: user.name,
            username: user.username,
            bio: user.bio || "",
            status: user.status || "",
            avatarUrl: user.avatarUrl || "",
            bannerUrl: user.bannerUrl || "",
            vibes: user.vibesCount,
            email: user.email,
            phone: user.phone || "",
            countryCode: user.countryCode || "+55",
          }}
          onUpdate={reload}
        />
      )}

      {isCreateOpen && (
        <CreatePostModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            reload();
          }}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            reload();
          }}
        />
      )}

      {isCreateAtrioOpen && (
        <CreateAtrioModal
          onClose={() => setIsCreateAtrioOpen(false)}
          onSuccess={() => {
            setIsCreateAtrioOpen(false);
            reload();
          }}
        />
      )}

      {editingAtrioItem && (
        <EditAtrioModal
          item={editingAtrioItem}
          onClose={() => setEditingAtrioItem(null)}
          onSuccess={() => {
            setEditingAtrioItem(null);
            reload();
          }}
        />
      )}

      {/* Detail Post Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <PostCard
              id={selectedPost.id}
              authorId={user.id}
              authorName={user.name}
              authorAvatar={user.avatarUrl}
              content={selectedPost.content}
              mediaUrl={selectedPost.media_url}
              tags={selectedPost.tags}
              totalVibesReceived={selectedPost.likes_count || 0}
              totalComments={selectedPost.comments_count || 0}
              canEdit={true}
              canDelete={true}
              onEdit={() => {
                setEditingPost(selectedPost);
                setSelectedPost(null);
              }}
              onDelete={() => {
                handleDeletePost(selectedPost.id);
                setSelectedPost(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Compartilhamento de Lista do Santuário */}
      {sharingList && (
        <ShareListModal
          listId={sharingList.id}
          listName={sharingList.name}
          onClose={() => setSharingList(null)}
        />
      )}
    </div>
  );
}
