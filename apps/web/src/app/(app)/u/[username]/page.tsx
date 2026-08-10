"use client";

import React, { use } from "react";
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
} from "lucide-react";
import { usePublicProfile } from "@/view-models/usePublicProfile";
import { PostCard } from "@/components/molecules/PostCard";
import { Avatar } from "@/components/atoms/Avatar";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
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
    selectedPost,
    setActiveTab,
    setSelectedPost,
    handleFollowToggle,
    handleAddFriend,
  } = usePublicProfile(username);

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
                    <ShieldCheck size={20} />
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
          <span>Publicações</span>
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
          <span>Átrio</span>
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
          <span>Grupos</span>
        </button>
      </div>

      {/* Conteúdo da Aba */}
      <div className="min-h-[300px]">
        {activeTab === "posts" && (
          <div>
            {posts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square group relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/60 cursor-pointer shadow-md"
                  >
                    {post.media_url ? (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex items-center justify-center text-center text-slate-300 text-xs bg-slate-900/80 leading-relaxed overflow-hidden font-medium">
                        {post.content.length > 80
                          ? `${post.content.slice(0, 80)}...`
                          : post.content}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                      <span className="flex items-center gap-1">
                        <Zap size={15} fill="currentColor" className="text-amber-400" />
                        {post.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={15} fill="currentColor" className="text-blue-400" />
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
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
                {atrioItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] bg-slate-800 border border-slate-700/60 shadow-md"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                    </div>
                  </div>
                ))}
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
                  <div
                    key={group.id}
                    className="flex items-center gap-4 bg-[#1e293b] p-4 rounded-2xl border border-slate-700/80 shadow-md"
                  >
                    <img
                      src={group.avatarUrl}
                      alt={group.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{group.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{group.description}</p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-800 text-[#50c878] border border-slate-700 uppercase tracking-wide">
                      {group.role}
                    </span>
                  </div>
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

      {/* Modal de Detalhes do Post */}
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
              >
                <X size={16} />
              </button>
            </div>

            <PostCard
              id={selectedPost.id}
              authorName={profile.name}
              authorAvatar={profile.avatarUrl}
              content={selectedPost.content}
              mediaUrl={selectedPost.media_url}
              tags={selectedPost.tags}
              totalVibesReceived={selectedPost.likes_count || 0}
              totalComments={selectedPost.comments_count || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
