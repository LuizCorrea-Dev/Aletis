"use client";

import { useState, useCallback, useEffect, useOptimistic, useTransition } from "react";
import { getPostsAction, deletePostAction, updatePostAction } from "@/app/actions/post-actions";

export interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mediaUrl?: string;
  tags?: string[];
  totalVibesReceived: number;
  totalComments: number;
  userHasLiked?: boolean;
  isPinned?: boolean;
  createdAt?: string;
}

export function useFeed(initialTag?: string, communityId?: string) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic UI para Likes/Vibes no Feed
  const [optimisticPosts, setOptimisticPostVibe] = useOptimistic(
    posts,
    (state, updatedPostId: string) =>
      state.map((post) => {
        if (post.id === updatedPostId) {
          const hasLiked = post.userHasLiked;
          return {
            ...post,
            userHasLiked: !hasLiked,
            totalVibesReceived: hasLiked
              ? post.totalVibesReceived - 1
              : post.totalVibesReceived + 1,
          };
        }
        return post;
      })
  );

  const fetchPosts = useCallback(
    async (tag?: string) => {
      setIsLoading(true);
      try {
        const data = await getPostsAction(tag, communityId);
        setPosts(data as PostItem[]);
      } catch (err) {
        console.error("Erro ao buscar posts:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [communityId]
  );

  useEffect(() => {
    fetchPosts(selectedTag ?? undefined);
  }, [selectedTag, fetchPosts]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  const handleRefresh = () => {
    startTransition(() => {
      fetchPosts(selectedTag ?? undefined);
    });
  };

  const handleToggleVibe = (postId: string) => {
    startTransition(() => {
      setOptimisticPostVibe(postId);
    });
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    await deletePostAction(postId);
  };

  // Frequência das tags presentes nos posts
  const DEFAULT_TAGS = ["gratidão", "paz", "superação", "leveza", "amor", "crescimento", "mindfulness", "esperança", "conexão", "cura"];

  const tagCountsMap: Record<string, number> = {};
  posts.forEach((post) => {
    (post.tags || []).forEach((t) => {
      const clean = t.replace(/^#/, "").trim().toLowerCase();
      if (clean) {
        tagCountsMap[clean] = (tagCountsMap[clean] || 0) + 1;
      }
    });
  });

  const sortedTagsFromPosts = Object.entries(tagCountsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const top5Set = new Set(sortedTagsFromPosts.map((t) => t.tag));
  DEFAULT_TAGS.forEach((def) => {
    if (top5Set.size < 5) {
      top5Set.add(def);
    }
  });

  const top5Tags = Array.from(top5Set).slice(0, 5);
  const allTagsList = Array.from(
    new Set([...sortedTagsFromPosts.map((t) => t.tag), ...DEFAULT_TAGS])
  ).map((tag) => ({
    tag,
    count: tagCountsMap[tag] || 0,
  }));

  return {
    posts: optimisticPosts,
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
    reload: fetchPosts,
  };
}
