"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/auth";
import { CreatePostSchema } from "@aletis/domain";
import { PostgresPostRepository, PostgresSentinelaMemoryRepository, PostgresTransactionRepository, PostgresNotificationRepository } from "@aletis/infrastructure";

import { ModeratePostUseCase, ModerateCommentUseCase } from "@aletis/application";
import { searchSimilarDesabafos } from "./sentinela-memory-actions";


export async function createPostAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const rawTags = formData.get("tags") as string;
    let tags: string[] = [];
    if (rawTags) {
      try {
        const parsed = JSON.parse(rawTags);
        tags = Array.isArray(parsed) ? parsed : [rawTags];
      } catch {
        tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const rawData = {
      content: formData.get("content") as string,
      type: (formData.get("type") as "post" | "diary") || "post",
      communityId: (formData.get("communityId") as string) || undefined,
      mediaUrl: (formData.get("mediaUrl") as string) || undefined,
      tags,
      isAuthorAnonymous: formData.get("isAuthorAnonymous") === "true",
      authorVisibilityLevel: (formData.get("authorVisibilityLevel") as any) || "PUBLIC",
      allowedGroupIds: [],
      allowedUserIds: [],
    };

    const parsed = CreatePostSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const repository = new PostgresPostRepository();
    const memoryRepo = new PostgresSentinelaMemoryRepository();
    const useCase = new ModeratePostUseCase(
      repository,
      process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      process.env.OLLAMA_BRAIN_REASONING_MODEL || "deepseek-r1:1.5b",
      process.env.OLLAMA_BRAIN_MENTOR_MODEL || "llama3.2",
      process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
      memoryRepo
    );

    const result = await useCase.execute(parsed.data, user.id);

    if (result.success) {
      // Processa recompensas de Vibes (Orvalho do Dia + Post + Mídia)
      try {
        const txRepo = new PostgresTransactionRepository();
        const rewardResult = await txRepo.processPostRewards(
          user.id,
          Boolean(parsed.data.mediaUrl),
          (result as any).data?.id
        );
        (result as any).reward = rewardResult;
      } catch (err) {
        console.error("Erro ao processar recompensa de Vibes do post:", err);
      }

      if (parsed.data.communityId) {
        revalidatePath(`/communities/${parsed.data.communityId}`);
      } else {
        revalidatePath("/");
      }
    }

    return result;


  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, message: "Erro interno no servidor." };
  }
}

export async function getPostsAction(filterTag?: string, communityId?: string, page?: number) {
  try {
    const user = await getCurrentUser();
    const repository = new PostgresPostRepository();
    return await repository.getPosts(filterTag, communityId, page, user?.id);
  } catch (error) {
    console.error("Error in getPostsAction:", error);
    return [];
  }
}

export async function getVectorRecommendedPostsAction(queryText?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const memoryRepo = new PostgresSentinelaMemoryRepository();
    const userMem = await memoryRepo.getUserMemory(user.id);
    const searchPrompt = queryText || userMem?.summary || "busca de desabafos e acolhimento";

    const similarMems = await searchSimilarDesabafos(searchPrompt, 5);
    const repository = new PostgresPostRepository();
    const posts = await repository.getPosts(undefined, undefined, 1, user.id);

    // Se temos memórias similares, priorizar posts dos usuários com histórico vetorial em sintonia
    const sintonizedUserIds = new Set(similarMems.map((m) => m.userId));
    if (sintonizedUserIds.size > 0) {
      return posts.sort((a, b) => {
        const aMatch = a.authorId && sintonizedUserIds.has(a.authorId) ? 1 : 0;
        const bMatch = b.authorId && sintonizedUserIds.has(b.authorId) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    return posts;
  } catch (error) {
    console.error("Error in getVectorRecommendedPostsAction:", error);
    return [];
  }
}


export async function deletePostAction(postId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repository = new PostgresPostRepository();
    const result = await repository.deletePost(postId, user.id);
    if (result.success) {
      revalidatePath("/");
      revalidatePath("/profile");
    }
    return result;
  } catch (error) {
    console.error("deletePostAction error:", error);
    return { success: false, message: "Erro ao excluir o post." };
  }
}

export async function updatePostAction(postId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const content = formData.get("content") as string;
    const mediaUrl = (formData.get("mediaUrl") as string) || undefined;
    const rawTags = formData.get("tags") as string;
    let tags: string[] = [];
    if (rawTags) {
      try {
        const parsed = JSON.parse(rawTags);
        tags = Array.isArray(parsed) ? parsed : [rawTags];
      } catch {
        tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    if (!content) return { success: false, message: "O conteúdo não pode estar vazio." };

    const repository = new PostgresPostRepository();
    const success = await repository.updatePost(postId, content, tags, mediaUrl, user.id);

    if (success) {
      revalidatePath("/");
      revalidatePath("/profile");
      return { success: true, message: "Post atualizado!" };
    }
    return { success: false, message: "Você não tem permissão para editar este post." };
  } catch (error) {
    console.error("updatePostAction error:", error);
    return { success: false, message: "Erro interno no servidor." };
  }
}


export async function togglePinPostAction(postId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repository = new PostgresPostRepository();
    const success = await repository.togglePin(postId, true);
    if (success) {
      revalidatePath("/");
      return { success: true, isPinned: true, message: "Aviso alterado!" };
    }
    return { success: false, message: "Falha ao alterar o aviso." };
  } catch (error) {
    console.error("togglePinPostAction error:", error);
    return { success: false, message: "Erro interno no servidor." };
  }
}

export interface TransferVibeInput {
  recipientUserId?: string;
  postId?: string;
  commentId?: string;
  atrioId?: string;
  channelMessageId?: string;
}

export async function transferVibeAction(input: TransferVibeInput) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Você precisa estar autenticado.", newBalance: 0 };

    const txRepo = new PostgresTransactionRepository();
    const res = await txRepo.transferVibe(
      input.recipientUserId || "00000000-0000-0000-0000-000000000000",
      1,
      input.postId,
      input.commentId,
      user.id
    );

    if (res.success) {
      if (input.recipientUserId && input.recipientUserId !== user.id) {
        const notifRepo = new PostgresNotificationRepository();
        await notifRepo.createNotification({
          userId: input.recipientUserId,
          actorId: user.id,
          type: "LIKE",
          title: "Vibe Recebida",
          content: "Você recebeu 1 Vibe em uma publicação!",
          linkUrl: "/feed",
        });
      }
      revalidatePath("/");
      revalidatePath("/feed");
    }


    return res;
  } catch (error: any) {
    console.error("Error in transferVibeAction:", error);
    return { success: false, message: error.message || "Erro ao doar Vibe.", newBalance: 0 };
  }
}

export interface CommentItem {
  id: string;
  postId?: string;
  atrioItemId?: string;
  parentId?: string | null;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  vibesCount: number;
  userHasVibed: boolean;
}

export async function getCommentsAction(target: { postId?: string; atrioId?: string }): Promise<CommentItem[]> {
  try {
    if (!target.postId) return [];
    const repository = new PostgresPostRepository();
    const comments = await repository.getPostComments(target.postId);
    return comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      parentId: c.parentId,
      userId: c.userId,
      authorName: c.authorName,
      authorAvatar: c.authorAvatar,
      content: c.content,
      createdAt: c.createdAt,
      vibesCount: c.vibes,
      userHasVibed: c.userHasLiked,
    }));
  } catch (error) {
    console.error("Error in getCommentsAction:", error);
    return [];
  }
}

export async function createCommentAction(target: {
  postId?: string;
  atrioId?: string;
  parentId?: string;
  recipientUserId?: string;
  content: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Você precisa estar autenticado." };

    const text = target.content.trim();
    if (!text || text.length < 10) {
      return {
        success: false,
        message: "O comentário precisa ser mais detalhado para promover conversas intencionais.",
      };
    }

    const memoryRepo = new PostgresSentinelaMemoryRepository();
    const moderateUseCase = new ModerateCommentUseCase(
      process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      process.env.OLLAMA_BRAIN_REASONING_MODEL || "deepseek-r1:1.5b",
      process.env.OLLAMA_BRAIN_MENTOR_MODEL || "llama3.2",
      process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
      memoryRepo
    );

    const modResult = await moderateUseCase.execute({
      postId: target.postId || "",
      authorId: user.id,
      authorName: user.username,
      content: text,
    });

    if (!modResult.success || !modResult.safe) {
      return {
        success: false,
        sentinelaBlocked: true,
        inTimeout: modResult.inTimeout,
        penaltyApplied: modResult.penaltyApplied,
        message: modResult.message || "O Sentinela bloqueou seu comentário.",
      };
    }

    const repository = new PostgresPostRepository();
    await repository.addComment(
      {
        postId: target.postId || "",
        content: text,
        parentId: target.parentId,
      },
      user.id
    );

    if (target.postId) revalidatePath("/feed");

    const commentItem: CommentItem = {
      id: Date.now().toString(),
      postId: target.postId,
      atrioItemId: target.atrioId,
      parentId: target.parentId,
      userId: user.id,
      authorName: user.username,
      authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
      content: text,
      createdAt: new Date().toISOString(),
      vibesCount: 0,
      userHasVibed: false,
    };

    return {
      success: true,
      data: commentItem,
      readabilityBonusApplied: false,
      newBalance: 1000,
      sentinelaBlocked: false,
      inTimeout: false,
      penaltyApplied: false,
      message: "Comentário adicionado com sucesso!",
    };
  } catch (error: any) {
    console.error("Error in createCommentAction:", error);
    return { success: false, message: error.message || "Erro ao publicar comentário." };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repository = new PostgresPostRepository();
    return await repository.deleteComment(commentId, user.id);
  } catch (error: any) {
    console.error("Error in deleteCommentAction:", error);
    return { success: false, message: error.message || "Erro ao excluir comentário." };
  }
}

