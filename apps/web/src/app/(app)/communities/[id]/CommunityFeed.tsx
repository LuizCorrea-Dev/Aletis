"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Send, PenTool, Image as ImageIcon } from "lucide-react";
import { getPostsAction, createPostAction, togglePinPostAction, deletePostAction } from "@/app/actions/post-actions";
import { PostCard } from "@/components/features/PostCard";
import { Community, Post } from "@aletis/domain";

interface CommunityFeedProps {
  community: Community;
  isMember: boolean;
  canModeratorDelete?: boolean;
  onVibeUpdate?: (newBalance: number) => void;
}

// COMPONENTE: Área de criação de post específica para a comunidade (Fiel ao Escopo Inicial)
const CommunityPostInput: React.FC<{
  communityId: string;
  userAvatar?: string;
  onPosted: () => void;
}> = ({ communityId, userAvatar, onPosted }) => {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("communityId", communityId);
      formData.append("type", "post");
      if (mediaUrl.trim()) {
        formData.append("mediaUrl", mediaUrl.trim());
      }

      const res = await createPostAction(formData);
      if (res.success) {
        setContent("");
        setMediaUrl("");
        setIsExpanded(false);
        onPosted();
      } else {
        alert(res.message || "Erro ao publicar no mural.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar comunicado.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-2xl transition-all duration-300 shadow-md ${isExpanded ? "p-4 ring-1 ring-mint-500/30" : "p-3 hover:bg-slate-900/80"
        }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg"}
          className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700 shrink-0 mt-0.5"
          alt=""
        />
        <div className="flex-1">
          {!isExpanded ? (
            <input
              type="text"
              placeholder="Postar no Mural de Avisos..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none py-1.5 cursor-pointer font-medium"
              onFocus={() => setIsExpanded(true)}
              readOnly
            />
          ) : (
            <div className="space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva um aviso ou comunicado para a tribo..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 transition-colors resize-none min-h-22.5 font-medium"
                autoFocus
              />

              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL de imagem opcional (https://...)"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-mint-500 transition-colors"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isPosting || !content.trim()}
                  className="px-5 py-2 bg-mint-500 hover:bg-mint-600 text-slate-900 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isPosting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={12} /> Postar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CommunityFeed({
  community,
  isMember,
  canModeratorDelete = false,
  onVibeUpdate,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getPostsAction(undefined, community.id);
      setPosts(data as any[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [community.id]);

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabeçalho do Mural */}
        <div className="bg-slate-900/40 rounded-2xl p-4 text-center border border-slate-800 border-dashed">
          <h3 className="text-white font-bold text-sm mb-1 font-display">
            Mural de Avisos
          </h3>
          <p className="text-slate-400 text-xs">
            Este mural é exclusivo dos membros da comunidade "{community.name}".
          </p>
        </div>

        {/* Área de Criação de Post no Mural (Apenas Dono e Moderadores) */}
        {canModeratorDelete ? (
          <CommunityPostInput
            communityId={community.id}
            userAvatar={community.avatarUrl}
            onPosted={fetchPosts}
          />
        ) : (
          <div className="bg-slate-900/30 rounded-xl p-3.5 text-center border border-slate-800/80 text-xs text-slate-400">
            <span className="font-bold text-slate-300">Modo Leitura:</span> Apenas o Dono e Moderadores da comunidade podem publicar e gerenciar avisos neste mural.
          </div>
        )}

        {/* Listagem de Publicações */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
              <Loader2 className="animate-spin text-mint-500" size={32} />
              <span className="text-xs font-semibold">Carregando avisos...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-14 text-slate-500 border border-slate-900 border-dashed rounded-2xl p-6">
              <span className="font-semibold text-sm block mb-1">Nenhum aviso ainda</span>
              <span className="text-xs text-slate-600">
                Seja o primeiro a compartilhar um comunicado nesta tribo!
              </span>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                {...(post as any)}
                canDelete={canModeratorDelete}
                canEdit={canModeratorDelete}
                canPin={canModeratorDelete}
                onPin={async () => {
                  await togglePinPostAction(post.id);
                  fetchPosts();
                }}
                onDelete={async () => {
                  await deletePostAction(post.id);
                  fetchPosts();
                }}
                onUpdated={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
