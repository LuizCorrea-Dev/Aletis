"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Activity,
  MessageCircle,
  UserPlus,
  Zap,
  Anchor,
  ShieldCheck,
  BarChart2,
  Users,
  Grid,
  Sparkles,
  Building2,
  Loader2,
  ArrowLeft,
  Footprints,
  X,
  ChevronLeft,
  ChevronRight,
  Film,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { usePublicProfile } from "@/view-models/usePublicProfile";
import { PostCard } from "@/components/molecules/PostCard";
import { Avatar } from "@/components/atoms/Avatar";
import { UserIdentity } from "@/components/molecules/UserIdentity";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

function parseMediaUrl(mediaUrlStr?: string | null): { url: string | null; isVideo: boolean; isPdf: boolean } {
  if (!mediaUrlStr) return { url: null, isVideo: false, isPdf: false };
  let url = mediaUrlStr;
  try {
    if (mediaUrlStr.trim().startsWith("[")) {
      const parsed = JSON.parse(mediaUrlStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        url = parsed[0];
      }
    }
  } catch {}

  const isVideo =
    url.startsWith("data:video/") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.includes("video/");
  const isPdf =
    url.startsWith("data:application/pdf") ||
    url.endsWith(".pdf") ||
    url.includes("application/pdf");

  return { url, isVideo, isPdf };
}

export default function PublicProfilePage(props: PublicProfilePageProps) {
  const params = use(props.params);
  const { username } = params;
  const router = useRouter();

  const {
    profile,
    isOwnProfile,
    posts,
    atrioItems,
    groups,
    followersCount,
    friendsCount,
    isFollowing,
    friendStatus,
    isLoading,
    isProcessing,
    activeTab,
    setActiveTab,
    handleFollowToggle,
    handleAddFriend,
  } = usePublicProfile(username);

  // Estado do Modal de Visualização com Navegação Anterior/Próximo (setas)
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    type: "post" | "atrio" | null;
    index: number;
  }>({
    isOpen: false,
    type: null,
    index: 0,
  });

  const handleOpenViewer = (type: "post" | "atrio", index: number) => {
    setViewerState({ isOpen: true, type, index });
  };

  const handleCloseViewer = () => {
    setViewerState({ isOpen: false, type: null, index: 0 });
  };

  const handlePrevItem = () => {
    setViewerState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }));
  };

  const handleNextItem = () => {
    const maxIndex =
      viewerState.type === "post" ? posts.length - 1 : atrioItems.length - 1;
    setViewerState((prev) => ({
      ...prev,
      index: Math.min(maxIndex, prev.index + 1),
    }));
  };

  // Suporte a teclas de atalho (Seta Esquerda, Seta Direita, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewerState.isOpen) return;

      if (e.key === "ArrowLeft") {
        handlePrevItem();
      } else if (e.key === "ArrowRight") {
        handleNextItem();
      } else if (e.key === "Escape") {
        handleCloseViewer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewerState.isOpen, viewerState.type, viewerState.index, posts.length, atrioItems.length]);

  const handleChat = () => {
    router.push("/connections");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-[#50c878]" size={40} />
        <p className="text-sm font-medium">Carregando perfil de @{username}...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="p-4 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400">
          <Users size={36} />
        </div>
        <h2 className="text-xl font-bold text-white">Usuário não encontrado</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Não foi possível encontrar o perfil do usuário <strong className="text-white">@{username}</strong>.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 rounded-full bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold text-sm transition-all cursor-pointer shadow-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  const currentPost = viewerState.type === "post" ? posts[viewerState.index] : null;
  const currentAtrio = viewerState.type === "atrio" ? atrioItems[viewerState.index] : null;
  const totalViewerItems = viewerState.type === "post" ? posts.length : atrioItems.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-28">
      {/* Botão voltar mobile */}
      <div className="md:hidden flex items-center gap-3 mb-4 text-slate-400">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="font-bold text-white text-sm">Perfil de @{profile.username}</span>
      </div>

      {/* Card da Capa & Perfil */}
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-3xl shadow-2xl mb-8 relative overflow-hidden group">
        {/* Banner com Gradiente */}
        <div className="h-44 md:h-56 relative overflow-hidden bg-slate-800">
          <img
            src={profile.bannerUrl}
            alt="Banner de capa"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/70 to-transparent" />
        </div>

        {/* Conteúdo Principal do Perfil */}
        <div className="relative z-10 px-6 pb-6 md:px-8 -mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div
                className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1"
                style={{ background: "linear-gradient(135deg, #50c878 0%, #2ca254 100%)" }}
              >
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.name}
                  size="xl"
                  className="w-full h-full border-4 border-[#1e293b]"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-[#50c878] text-[#0f172a] p-1 rounded-full border-2 border-[#1e293b] flex items-center justify-center shadow-md">
                <Check size={14} strokeWidth={4} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left mt-2 md:mt-12">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1 font-display drop-shadow-md flex items-center justify-center md:justify-start gap-2">
                {profile.name}
                {profile.tipoPerfil === "ancora" ? (
                  <span className="text-[var(--tier-ancora-color)]" title="Membro Âncora">
                    <Anchor size={20} />
                  </span>
                ) : profile.tipoPerfil === "verificado" ? (
                  <span className="text-[var(--tier-verificado-color)]" title="Profissional Verificado">
                    <ShieldCheck size={20} className="fill-sky-400/20 text-sky-400" />
                  </span>
                ) : (
                  <span className="text-[var(--tier-comum-color)]" title="Membro Comum">
                    <Zap size={20} fill="currentColor" />
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-xs font-semibold mb-2">@{profile.username}</p>

              {profile.bio && (
                <p className="text-slate-200 text-sm leading-relaxed max-w-xl mx-auto md:mx-0 mb-6 font-medium">
                  {profile.bio}
                </p>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] transition-all px-6 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 active:scale-95 shadow-md cursor-pointer"
                  >
                    <span>Editar Seu Perfil</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={isProcessing}
                      className={`px-6 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
                        isFollowing
                          ? "bg-transparent border-2 border-[#50c878] text-[#50c878] hover:bg-[#50c878]/10"
                          : "bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a]"
                      }`}
                    >
                      {isFollowing ? <Footprints size={18} /> : <Activity size={18} />}
                      <span>{isFollowing ? "Seguindo" : "Seguir Caminho"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleChat}
                      className="bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600 transition-all px-6 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 active:scale-95 backdrop-blur-sm cursor-pointer shadow-md"
                    >
                      <MessageCircle size={18} />
                      <span>Conversar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddFriend}
                      disabled={friendStatus !== "none" || isProcessing}
                      className="bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600 transition-all px-6 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 active:scale-95 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                    >
                      {friendStatus === "accepted" ? <Check size={18} /> : <UserPlus size={18} />}
                      <span>
                        {friendStatus === "none"
                          ? "Add Amigo"
                          : friendStatus === "pending"
                          ? "Pendente"
                          : "Amigos"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Zap size={14} fill="currentColor" />
                Vibes
              </div>
              <div className="text-xl md:text-2xl font-black text-white drop-shadow-sm">
                {profile.vibesCount >= 1000
                  ? `${(profile.vibesCount / 1000).toFixed(1)}k`
                  : profile.vibesCount}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#50c878] text-xs font-extrabold uppercase tracking-wider mb-1">
                <BarChart2 size={14} />
                Seguidores
              </div>
              <div className="text-xl md:text-2xl font-black text-white drop-shadow-sm">
                {followersCount}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Users size={14} />
                Amigos
              </div>
              <div className="text-xl md:text-2xl font-black text-white drop-shadow-sm">
                {friendsCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center gap-6 mb-6 border-b border-slate-700/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`pb-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "posts"
              ? "text-[#50c878] border-[#50c878]"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          <Grid size={18} />
          <span>Publicações ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("atrio")}
          className={`pb-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "atrio"
              ? "text-[#50c878] border-[#50c878]"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          <Sparkles size={18} />
          <span>Átrio ({atrioItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={`pb-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "groups"
              ? "text-[#50c878] border-[#50c878]"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          <Building2 size={18} />
          <span>Grupos ({groups.length})</span>
        </button>
      </div>

      {/* Conteúdo da Aba */}
      <div className="min-h-[300px]">
        {activeTab === "posts" && (
          <div>
            {posts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {posts.map((post, idx) => {
                  const media = parseMediaUrl(post.mediaUrl || post.media_url);
                  const likesCount = post.totalVibesReceived ?? post.likes_count ?? 0;
                  const commentsCount = post.totalComments ?? post.comments_count ?? 0;

                  return (
                    <div
                      key={post.id}
                      onClick={() => handleOpenViewer("post", idx)}
                      className="aspect-square group relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/60 cursor-pointer shadow-md hover:border-[#50c878]/60 transition-all"
                    >
                      {media.url ? (
                        media.isVideo ? (
                          <div className="w-full h-full relative">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            <span className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white backdrop-blur-sm">
                              <Film size={14} />
                            </span>
                          </div>
                        ) : media.isPdf ? (
                          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-slate-900/90 text-slate-300">
                            <FileText size={32} className="text-[#50c878] mb-2" />
                            <span className="text-[11px] font-bold">Documento PDF</span>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt="Mídia da publicação"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="w-full h-full p-4 flex items-center justify-center text-center text-slate-300 text-xs bg-slate-900/80 leading-relaxed overflow-hidden font-medium">
                          {post.content.length > 90
                            ? `${post.content.slice(0, 90)}...`
                            : post.content}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                        <span className="flex items-center gap-1">
                          <Zap size={15} fill="currentColor" className="text-amber-400" />
                          {likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={15} fill="currentColor" className="text-blue-400" />
                          {commentsCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                <p className="text-sm font-medium">Nenhuma publicação encontrada para este perfil.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "atrio" && (
          <div>
            {atrioItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {atrioItems.map((item, idx) => {
                  const media = parseMediaUrl(item.url);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenViewer("atrio", idx)}
                      className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] bg-slate-800 border border-slate-700/60 shadow-md hover:border-[#50c878]/60 transition-all"
                    >
                      {media.url ? (
                        media.isVideo ? (
                          <div className="w-full h-full relative">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            <span className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white backdrop-blur-sm">
                              <Film size={14} />
                            </span>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="w-full h-full p-4 flex items-center justify-center text-center text-white bg-slate-900 font-bold">
                          {item.title}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                <p className="text-sm font-medium">Átrio vazio.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "groups" && (
          <div>
            {groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/communities/${group.id}`}
                    className="flex items-center gap-4 bg-[#1e293b] hover:bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 hover:border-[#50c878]/60 shadow-md transition-all cursor-pointer group"
                  >
                    <img
                      src={group.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=Group"}
                      alt={group.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-[#50c878] transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{group.description || "Comunidade da Aletis"}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-[#50c878] border border-slate-700 uppercase tracking-wide">
                        {group.role}
                      </span>
                      <span className="text-xs font-bold text-[#50c878] flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        Visitar <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                <p className="text-sm font-medium">Nenhum grupo público.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal / Overlay de Detalhes da Publicação com Setas de Navegação */}
      {viewerState.isOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in"
          onClick={handleCloseViewer}
        >
          {/* Top Bar: Contador + Fechar */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-50 flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-800/80 text-slate-300 font-extrabold text-xs rounded-full border border-slate-700 backdrop-blur-md">
              {viewerState.type === "post"
                ? `Publicação ${viewerState.index + 1} de ${totalViewerItems}`
                : `Átrio ${viewerState.index + 1} de ${totalViewerItems}`}
            </span>
          </div>

          <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
            <button
              type="button"
              onClick={handleCloseViewer}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer shadow-lg"
              title="Fechar (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Seta Esquerda (<) */}
          {viewerState.index > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevItem();
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 bg-slate-800/90 hover:bg-[#50c878] hover:text-[#0f172a] text-white rounded-full border border-slate-700 shadow-2xl transition-all cursor-pointer z-50 active:scale-90"
              title="Publicação Anterior (Seta Esquerda)"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Seta Direita (>) */}
          {viewerState.index < totalViewerItems - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextItem();
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 bg-slate-800/90 hover:bg-[#50c878] hover:text-[#0f172a] text-white rounded-full border border-slate-700 shadow-2xl transition-all cursor-pointer z-50 active:scale-90"
              title="Próxima Publicação (Seta Direita)"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Conteúdo do Modal */}
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {viewerState.type === "post" && currentPost && (
              <PostCard
                id={currentPost.id}
                authorName={profile.name}
                authorUsername={profile.username}
                authorAvatar={profile.avatarUrl}
                authorTipoPerfil={profile.tipoPerfil}
                content={currentPost.content}
                mediaUrl={currentPost.mediaUrl || currentPost.media_url}
                tags={currentPost.tags}
                totalVibesReceived={currentPost.totalVibesReceived ?? currentPost.likes_count ?? 0}
                totalComments={currentPost.totalComments ?? currentPost.comments_count ?? 0}
              />
            )}

            {viewerState.type === "atrio" && currentAtrio && (
              <div className="bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6 text-white">
                <div className="mb-4">
                  <UserIdentity
                    name={profile.name}
                    username={profile.username}
                    avatarUrl={profile.avatarUrl}
                    tipoPerfil={profile.tipoPerfil}
                    size="md"
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 max-h-[60vh] flex items-center justify-center mb-4">
                  {(() => {
                    const media = parseMediaUrl(currentAtrio.url);
                    if (!media.url) return null;
                    if (media.isVideo) {
                      return (
                        <video
                          src={media.url}
                          controls
                          autoPlay
                          className="max-h-[55vh] w-auto mx-auto object-contain rounded-xl"
                        />
                      );
                    }
                    return (
                      <img
                        src={media.url}
                        alt={currentAtrio.title}
                        className="max-h-[55vh] w-auto mx-auto object-contain rounded-xl"
                      />
                    );
                  })()}
                </div>

                <h3 className="text-xl font-bold font-display text-white mb-2">{currentAtrio.title}</h3>
                {currentAtrio.description && (
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{currentAtrio.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
