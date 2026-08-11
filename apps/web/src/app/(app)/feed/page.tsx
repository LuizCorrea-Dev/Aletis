"use client";

import React, { useState, useRef, useEffect } from "react";
import { Hash, X, Plus, RefreshCw, Search, Flame, Check } from "lucide-react";
import { useFeed } from "@/view-models/useFeed";
import { PostCard } from "@/components/molecules/PostCard";
import { PostSkeleton } from "@/components/molecules/PostSkeleton";
import { CreatePostModal } from "@/components/features/CreatePostModal";
import { EditPostModal } from "@/components/features/EditPostModal";
import { RewardCelebrationModal, RewardData } from "@/components/features/RewardCelebrationModal";

export default function FeedPage() {
  const [activeReward, setActiveReward] = useState<RewardData | null>(null);
  const [searchTagQuery, setSearchTagQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    posts,
    isLoading,
    isPending,
    selectedTag,
    top5Tags,
    allTagsList,
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

  // Fecha dropdown de busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra tags para o autocompletar da busca
  const filteredTags = allTagsList.filter((item) =>
    item.tag.toLowerCase().includes(searchTagQuery.toLowerCase().replace(/^#/, "").trim())
  );

  return (
    <div className="w-full max-w-screen-md mx-auto px-1.5 sm:px-4 md:px-3 py-1 md:py-3 min-h-screen pb-32">
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

        {/* Campo de Busca de Tags com Autocompletar */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTagQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchTagQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Buscar ou filtrar por tag (ex: #gratidão, #paz)..."
              className="w-full bg-slate-800/70 border border-slate-700/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#50c878] focus:bg-slate-800 transition-all shadow-inner"
            />
            {searchTagQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchTagQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 p-1.5">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Tags Encontradas ({filteredTags.length})</span>
                <span className="text-slate-500 font-normal">Selecione para filtrar</span>
              </div>
              {filteredTags.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                  Nenhuma tag encontrada para "{searchTagQuery}"
                </div>
              ) : (
                filteredTags.map(({ tag, count }) => {
                  const isTop5 = top5Tags.includes(tag);
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        handleTagSelect(tag);
                        setIsSearchOpen(false);
                        setSearchTagQuery("");
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#50c878]/20 text-[#50c878] font-bold"
                          : "hover:bg-slate-800/80 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={12} className={isSelected ? "text-[#50c878]" : "text-slate-400"} />
                        <span className="font-semibold">#{tag}</span>
                        {isTop5 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30 flex items-center gap-0.5">
                            <Flame size={10} fill="currentColor" /> Top 5
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {count > 0 ? `${count} vibe${count > 1 ? "s" : ""}` : "Sugerida"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Seção das Top 5 Tags Mais Utilizadas */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={14} className="text-amber-400" fill="currentColor" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              Tags Mais Utilizadas
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {top5Tags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border whitespace-nowrap flex-shrink-0 cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-[#50c878] text-[#1e293b] border-[#50c878] shadow-[0_0_14px_rgba(80,200,120,0.4)]"
                      : "bg-slate-800/80 text-amber-300 border-amber-500/30 hover:border-amber-400/60 hover:text-white"
                  }`}
                >
                  <Hash size={11} />
                  {tag}
                  {isSelected && <X size={11} className="ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Lista de Posts */}
      <section className="space-y-4 mt-4">
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

      {/* FAB - Botão Flutuante Posicionado Acima do Menu Inferior */}
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-28 md:bottom-10 right-6 bg-[#50c878] text-[#1e293b] p-4 rounded-full shadow-[0_0_24px_rgba(80,200,120,0.5)] hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
        title="Nova Vibe"
      >
        <Plus size={26} strokeWidth={3} />
      </button>

      {/* Modal de Criação */}
      {isCreateOpen && (
        <CreatePostModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(reward) => {
            setIsCreateOpen(false);
            reload(selectedTag ?? undefined);
            if (reward) {
              setActiveReward(reward);
            }
          }}
        />
      )}

      {/* Modal de Celebração de Recompensa (Orvalho + Vibes) */}
      {activeReward && (
        <RewardCelebrationModal
          reward={activeReward}
          onClose={() => setActiveReward(null)}
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
