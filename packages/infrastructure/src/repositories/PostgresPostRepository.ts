import { Pool } from "pg";
import { IPostRepository, Post, CreatePostData, Comment, CreateCommentData } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresPostRepository implements IPostRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  private applyPrivacyFilter(post: any, currentUserId?: string): Post {
    const isOwner = currentUserId && post.author_id === currentUserId;
    const isAnon = post.is_author_anonymous || post.is_anonymous || post.is_private;

    return {
      id: post.id,
      authorId: isAnon && !isOwner ? null : post.author_id,
      authorName: isAnon && !isOwner ? "Anônimo" : post.author_name || "Desconhecido",
      authorAvatar: isAnon && !isOwner ? undefined : post.author_avatar || undefined,
      content: post.content,
      mediaUrl: post.media_url || null,
      tags: typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags || [],
      initialVibes: post.initial_vibes || 0,
      totalVibesReceived: post.likes_count || post.total_vibes_received || 0,
      totalComments: post.comments_count || post.total_comments || 0,
      type: post.post_type || post.type || "post",
      communityId: post.community_id || null,
      createdAt: new Date(post.created_at).toISOString(),
      userHasLiked: false,
      isPinned: post.is_pinned ?? false,
      isAuthorAnonymous: isAnon ?? false,
      authorVisibilityLevel: post.author_visibility_level || "PUBLIC",
      allowedGroupIds: [],
      allowedUserIds: [],
    };
  }

  async getPostRaw(postId: string): Promise<any | null> {
    const { rows } = await this.pool.query("SELECT * FROM posts WHERE id = $1 LIMIT 1", [postId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getPosts(filterTag?: string, communityId?: string, page: number = 1, currentUserId?: string): Promise<Post[]> {
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, pr.display_name as author_name, pr.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN profiles pr ON p.author_id = pr.id
      WHERE (p.is_private = false OR p.author_id = $1)
    `;
    const params: any[] = [currentUserId || "00000000-0000-0000-0000-000000000000"];

    if (filterTag) {
      params.push(`%"${filterTag}"%`);
      query += ` AND p.tags::text LIKE $${params.length}`;
    }

    if (communityId) {
      params.push(communityId);
      query += ` AND p.community_id = $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await this.pool.query(query, params);
    return rows.map((r) => this.applyPrivacyFilter(r, currentUserId));
  }

  async getUserPosts(userId: string, type?: string): Promise<Post[]> {
    let query = `
      SELECT p.*, pr.display_name as author_name, pr.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN profiles pr ON p.author_id = pr.id
      WHERE p.author_id = $1
    `;
    const params: any[] = [userId];
    if (type) {
      params.push(type);
      query += ` AND (p.post_type = $2 OR p.post_type IS NULL)`;
    }
    query += ` ORDER BY p.created_at DESC`;
    const { rows } = await this.pool.query(query, params);
    return rows.map((r) => this.applyPrivacyFilter(r, userId));
  }

  async createPost(data: CreatePostData, authorId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const targetUserId = authorId || (data as any).authorId;
      if (!targetUserId || targetUserId === "00000000-0000-0000-0000-000000000000") {
        return { success: false, message: "Sessão de usuário não identificada. Por favor, faça login novamente." };
      }

      // Verificação defensiva de integridade no Postgres
      const userCheck = await this.pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [targetUserId]);
      if (userCheck.rows.length === 0) {
        await this.pool.query(
          "INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
          [targetUserId, `user_${targetUserId.slice(0, 8)}@aletis.app`, "session_autocreated", "user"]
        );
        await this.pool.query(
          `INSERT INTO profiles (id, username, display_name, full_name, avatar_url, vibes_balance)
           VALUES ($1, $2, $3, $4, $5, 50) ON CONFLICT (id) DO NOTHING`,
          [targetUserId, `membro_${targetUserId.slice(0, 8)}`, "Membro Aletis", "Membro Aletis", `https://api.dicebear.com/7.x/initials/svg?seed=${targetUserId}`]
        );
      }

      const query = `
        INSERT INTO posts (author_id, content, tags, media_url, is_anonymous, post_type, community_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await this.pool.query(query, [
        targetUserId,
        data.content,
        JSON.stringify(data.tags || []),
        data.mediaUrl || null,
        data.isAuthorAnonymous || false,
        data.type || "post",
        data.communityId || null,
      ]);
      return { success: true, message: "Post criado com sucesso!" };
    } catch (err: any) {
      console.error("Database error in createPost:", err);
      if (err?.code === "23503" || String(err?.message || "").includes("violates foreign key constraint")) {
        return {
          success: false,
          message: "Sua conta não foi encontrada no banco de dados. Isso ocorre quando o servidor ou banco de dados são reiniciados. Por favor, faça login novamente para revalidar a sua sessão.",
        };
      }
      return { success: false, message: "Não foi possível salvar a publicação no momento. Tente novamente em instantes." };
    }
  }

  async deletePost(postId: string, currentUserId?: string): Promise<{ success: boolean; message?: string }> {
    if (currentUserId) {
      const { rows } = await this.pool.query(
        "DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING id",
        [postId, currentUserId]
      );
      if (rows.length === 0) {
        return { success: false, message: "Sem permissão para excluir este post." };
      }
      return { success: true };
    }
    await this.pool.query("DELETE FROM posts WHERE id = $1", [postId]);
    return { success: true };
  }

  async updatePost(postId: string, content: string, tags: string[], mediaUrl?: string, currentUserId?: string): Promise<boolean> {
    if (currentUserId) {
      const { rows } = await this.pool.query(
        "UPDATE posts SET content = $1, tags = $2, media_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND author_id = $5 RETURNING id",
        [content, JSON.stringify(tags), mediaUrl || null, postId, currentUserId]
      );
      return rows.length > 0;
    }
    await this.pool.query(
      "UPDATE posts SET content = $1, tags = $2, media_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
      [content, JSON.stringify(tags), mediaUrl || null, postId]
    );
    return true;
  }


  async togglePin(postId: string, isPinned: boolean): Promise<boolean> {
    await this.pool.query("UPDATE posts SET is_pinned = $1 WHERE id = $2", [isPinned, postId]);
    return true;
  }

  async getTrendingTags(): Promise<string[]> {
    const { rows } = await this.pool.query("SELECT tags FROM posts LIMIT 100");
    const tagCount: Record<string, number> = {};
    rows.forEach((r) => {
      const tags: string[] = typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [];
      tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 10);
  }

  async uploadMedia(file: File): Promise<string | null> {
    return "/uploads/" + file.name;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    const query = `
      SELECT c.*, pr.display_name as author_name, pr.avatar_url as author_avatar
      FROM comments c
      LEFT JOIN profiles pr ON c.author_id = pr.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;
    const { rows } = await this.pool.query(query, [postId]);
    return rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      userId: r.is_anonymous ? "00000000-0000-0000-0000-000000000000" : r.author_id,
      authorName: r.is_anonymous ? "Anônimo" : r.author_name || "Desconhecido",
      authorAvatar: r.is_anonymous ? undefined : r.author_avatar || undefined,
      content: r.content,
      vibes: r.vibes || 0,
      createdAt: new Date(r.created_at).toISOString(),
      userHasLiked: false,
      parentId: r.parent_id || null,
    }));
  }

  async addComment(data: CreateCommentData, userId: string): Promise<{ success: boolean; message: string }> {
    await this.pool.query(
      "INSERT INTO comments (post_id, author_id, content, parent_id) VALUES ($1, $2, $3, $4)",
      [data.postId, userId, data.content, data.parentId || null]
    );
    await this.pool.query("UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1", [data.postId]);

    // Enviar notificação para o autor do post
    const { rows: postRows } = await this.pool.query("SELECT author_id FROM posts WHERE id = $1", [data.postId]);
    if (postRows.length > 0 && postRows[0].author_id !== userId) {
      await this.pool.query(
        `INSERT INTO notifications (user_id, actor_id, type, title, content, link_url)
         VALUES ($1, $2, 'COMMENT', 'Novo Comentário', 'Alguém comentou no seu desabafo.', $3)`,
        [postRows[0].author_id, userId, "/feed"]
      );
    }

    return { success: true, message: "Comentário adicionado!" };
  }

  async deleteComment(commentId: string, currentUserId?: string): Promise<{ success: boolean; message?: string }> {
    if (currentUserId) {
      const { rows } = await this.pool.query(
        `DELETE FROM comments 
         WHERE id = $1 AND (author_id = $2 OR post_id IN (SELECT id FROM posts WHERE author_id = $2))
         RETURNING post_id`,
        [commentId, currentUserId]
      );
      if (rows.length === 0) {
        return { success: false, message: "Sem permissão para excluir este comentário." };
      }
      await this.pool.query("UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [rows[0].post_id]);
      return { success: true };
    }

    const { rows } = await this.pool.query("DELETE FROM comments WHERE id = $1 RETURNING post_id", [commentId]);
    if (rows.length > 0) {
      await this.pool.query("UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [rows[0].post_id]);
    }
    return { success: true };
  }

  subscribeToFeedUpdates(callback: (payload: any) => void): { unsubscribe: () => void } {
    return { unsubscribe: () => { } };
  }
}

