"use client";

import React from "react";
import { Hash, X, Plus, RefreshCw } from "lucide-react";
import { useFeed } from "@/view-models/useFeed";
import { PostCard } from "@/components/molecules/PostCard";
import { PostSkeleton } from "@/components/molecules/PostSkeleton";
import { CreatePostModal } from "@/components/features/CreatePostModal";
import { EditPostModal } from "@/components/features/EditPostModal";

const TRENDING_TAGS = [
  "gratidão",
  "paz",
  "superação",
  "leveza",
  "amor",
  "crescimento",
  "mindfulness",
  "esperança",
  "conexão",
  "cura",
];

export default function FeedPage() {
  const {
    posts,
    isLoading,
    isPending,
    selectedTag,
    isCreateOpen,
    editingPost,
    setIsCreateOpen,
    setEditingPost,
    handleTagSelect,
    handleRefresh,
    handleToggleVibe,
    handleDeletePost,
    reload,
  } = useFeed();

  return (
    <div className="w-full max-w-screen-md mx-auto px-1.5 sm:px-4 md:px-3 py-1 md:py-3 min-h-screen pb-28">
      {/* Header Fixo */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
              Feed da <span className="text-[#50c878]">Alma</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Um refúgio seguro para compartilhar suas vibes e reflexões.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending || isLoading}
            className="p-2.5 rounded-2xl border border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            title="Atualizar feed"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin text-[#50c878]" : ""} />
          </button>
        </div>

        {/* Tags Trending */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {TRENDING_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#50c878] text-[#1e293b] border-[#50c878] shadow-[0_0_12px_rgba(80,200,120,0.3)]"
                    : "bg-slate-800/60 text-slate-400 border-slate-700/80 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                <Hash size={10} />
                {tag}
                {isSelected && <X size={10} className="ml-0.5" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* Lista de Posts */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center">
              <Hash size={24} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {selectedTag
                ? `Nenhum post com a tag #${selectedTag}.`
                : "Nenhum post encontrado. Seja o primeiro a compartilhar!"}
            </p>
            {selectedTag && (
              <button
                type="button"
                onClick={() => handleTagSelect(selectedTag)}
                className="mt-3 text-xs text-[#50c878] hover:underline font-bold"
              >
                Limpar filtro
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
              onTagClick={handleTagSelect}
              onVibeClick={() => handleToggleVibe(post.id)}
              canEdit={false}
              canDelete={false}
            />
          ))
        )}
      </section>

      {/* FAB - Botão Flutuante para Criar Post */}
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-24 md:bottom-10 right-6 bg-[#50c878] text-[#1e293b] p-4 rounded-full shadow-[0_0_24px_rgba(80,200,120,0.45)] hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
        title="Nova Vibe"
      >
        <Plus size={26} strokeWidth={3} />
      </button>

      {/* Modal de Criação */}
      {isCreateOpen && (
        <CreatePostModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            reload(selectedTag ?? undefined);
          }}
        />
      )}

      {/* Modal de Edição */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            reload(selectedTag ?? undefined);
          }}
        />
      )}
    </div>
  );
}
