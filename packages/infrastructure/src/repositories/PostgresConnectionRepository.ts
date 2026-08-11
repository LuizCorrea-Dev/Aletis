import { Pool } from "pg";
import { IConnectionRepository, Friend, PrivateMessage, MessageType } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresConnectionRepository implements IConnectionRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async getFollowState(targetId: string, currentUserId?: string): Promise<boolean> {
    if (!currentUserId || targetId === "current_user") return false;
    const { rows } = await this.pool.query(
      "SELECT 1 FROM connections WHERE follower_id = $1 AND following_id = $2 LIMIT 1",
      [currentUserId, targetId]
    );
    return rows.length > 0;
  }

  async getFollowers(targetUserId?: string): Promise<Friend[]> {
    if (!targetUserId) return [];
    const query = `
      SELECT c.follower_id as id, 
             COALESCE(pr.username, SPLIT_PART(u.email, '@', 1)) as name, 
             COALESCE(pr.display_name, pr.full_name, pr.username, SPLIT_PART(u.email, '@', 1)) as display_name,
             pr.avatar_url as avatar
      FROM connections c
      JOIN users u ON c.follower_id = u.id
      LEFT JOIN profiles pr ON c.follower_id = pr.id
      WHERE c.following_id = $1
    `;
    const { rows } = await this.pool.query(query, [targetUserId]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "usuario",
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "user")}`,
      status: "offline",
      unreadCount: 0,
      isFollowing: false,
    }));
  }

  async getFollowing(targetUserId?: string): Promise<Friend[]> {
    if (!targetUserId) return [];
    const query = `
      SELECT c.following_id as id, 
             COALESCE(pr.username, SPLIT_PART(u.email, '@', 1)) as name, 
             COALESCE(pr.display_name, pr.full_name, pr.username, SPLIT_PART(u.email, '@', 1)) as display_name,
             pr.avatar_url as avatar
      FROM connections c
      JOIN users u ON c.following_id = u.id
      LEFT JOIN profiles pr ON c.following_id = pr.id
      WHERE c.follower_id = $1
    `;
    const { rows } = await this.pool.query(query, [targetUserId]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "usuario",
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "user")}`,
      status: "offline",
      unreadCount: 0,
      isFollowing: true,
    }));
  }

  async getFriendshipStatus(targetId: string, currentUserId?: string): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
    if (!currentUserId || targetId === "current_user") return "none";
    
    // Checa se o usuário enviou solicitação
    const { rows: sentRows } = await this.pool.query(
      "SELECT status FROM connections WHERE follower_id = $1 AND following_id = $2 LIMIT 1",
      [currentUserId, targetId]
    );
    if (sentRows.length > 0) {
      return sentRows[0].status === "accepted" ? "accepted" : "pending_sent";
    }

    // Checa se o usuário recebeu solicitação
    const { rows: recvRows } = await this.pool.query(
      "SELECT status FROM connections WHERE follower_id = $1 AND following_id = $2 LIMIT 1",
      [targetId, currentUserId]
    );
    if (recvRows.length > 0) {
      return recvRows[0].status === "accepted" ? "accepted" : "pending_received";
    }

    return "none";
  }

  async getFriends(targetUserId?: string): Promise<Friend[]> {
    if (!targetUserId) return [];
    const query = `
      SELECT DISTINCT ON (c.friend_id)
        c.friend_id as id,
        COALESCE(pr.username, SPLIT_PART(u.email, '@', 1)) as name,
        COALESCE(pr.display_name, pr.full_name, pr.username, SPLIT_PART(u.email, '@', 1)) as display_name,
        pr.avatar_url as avatar
      FROM (
        SELECT CASE WHEN follower_id = $1 THEN following_id ELSE follower_id END as friend_id
        FROM connections
        WHERE (follower_id = $1 OR following_id = $1) 
          AND status = 'accepted'
      ) c
      JOIN users u ON u.id = c.friend_id
      LEFT JOIN profiles pr ON pr.id = u.id
      WHERE c.friend_id != $1
    `;
    const { rows } = await this.pool.query(query, [targetUserId]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "usuario",
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "user")}`,
      status: "online",
      unreadCount: 0,
      isFollowing: true,
      friendshipStatus: "accepted",
    }));
  }

  async getPendingRequests(targetUserId?: string): Promise<Friend[]> {
    if (!targetUserId) return [];
    const query = `
      SELECT c.follower_id as id, 
             COALESCE(pr.username, SPLIT_PART(u.email, '@', 1)) as name, 
             COALESCE(pr.display_name, pr.full_name, pr.username, SPLIT_PART(u.email, '@', 1)) as display_name,
             pr.avatar_url as avatar
      FROM connections c
      JOIN users u ON c.follower_id = u.id
      LEFT JOIN profiles pr ON c.follower_id = pr.id
      WHERE c.following_id = $1 AND c.status = 'pending'
    `;
    const { rows } = await this.pool.query(query, [targetUserId]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "usuario",
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "user")}`,
      status: "offline",
      unreadCount: 0,
      isFollowing: false,
      friendshipStatus: "pending_received",
    }));
  }

  async requestFriendship(targetId: string, currentUserId?: string): Promise<{ success: boolean; message: string }> {
    if (!currentUserId) return { success: false, message: "Usuário não autenticado" };
    if (currentUserId === targetId) return { success: false, message: "Você não pode conectar a si mesmo." };

    await this.pool.query(
      `INSERT INTO connections (follower_id, following_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (follower_id, following_id) DO UPDATE SET status = 'pending'`,
      [currentUserId, targetId]
    );

    const { rows: actorRows } = await this.pool.query("SELECT username, display_name FROM profiles WHERE id = $1", [currentUserId]);
    const actorName = actorRows[0]?.display_name || actorRows[0]?.username || "Um usuário";
    const actorUsername = actorRows[0]?.username || currentUserId;

    // Criar notificação para o alvo
    await this.pool.query(
      `INSERT INTO notifications (user_id, actor_id, type, title, content, link_url)
       VALUES ($1, $2, 'FRIEND_REQUEST', 'Nova Solicitação de Amizade', $3, $4)`,
      [targetId, currentUserId, `${actorName} enviou uma solicitação de amizade.`, `/u/${actorUsername}`]
    );

    return { success: true, message: "Solicitação de amizade enviada!" };
  }

  async acceptFriendship(requesterId: string, currentUserId?: string): Promise<boolean> {
    if (!currentUserId) return false;
    await this.pool.query(
      "UPDATE connections SET status = 'accepted' WHERE follower_id = $1 AND following_id = $2",
      [requesterId, currentUserId]
    );
    await this.pool.query(
      `INSERT INTO connections (follower_id, following_id, status)
       VALUES ($1, $2, 'accepted')
       ON CONFLICT (follower_id, following_id) DO UPDATE SET status = 'accepted'`,
      [currentUserId, requesterId]
    );

    const { rows: actorRows } = await this.pool.query("SELECT username, display_name FROM profiles WHERE id = $1", [currentUserId]);
    const actorName = actorRows[0]?.display_name || actorRows[0]?.username || "Um usuário";
    const actorUsername = actorRows[0]?.username || currentUserId;

    await this.pool.query(
      `INSERT INTO notifications (user_id, actor_id, type, title, content, link_url)
       VALUES ($1, $2, 'FRIEND_ACCEPT', 'Conexão Aceita', $3, $4)`,
      [requesterId, currentUserId, `${actorName} aceitou sua solicitação de amizade!`, `/u/${actorUsername}`]
    );
    return true;
  }

  async getConversations(currentUserId?: string): Promise<Friend[]> {
    if (!currentUserId) return [];
    const query = `
      SELECT DISTINCT ON (convs.other_id) 
        convs.other_id as id, 
        COALESCE(pr.username, SPLIT_PART(u.email, '@', 1)) as name, 
        COALESCE(pr.display_name, pr.full_name, pr.username, SPLIT_PART(u.email, '@', 1)) as display_name,
        pr.avatar_url as avatar
      FROM (
        SELECT recipient_id as other_id FROM direct_messages WHERE sender_id = $1
        UNION
        SELECT sender_id as other_id FROM direct_messages WHERE recipient_id = $1
      ) convs
      JOIN users u ON convs.other_id = u.id
      LEFT JOIN profiles pr ON convs.other_id = pr.id
    `;
    const { rows } = await this.pool.query(query, [currentUserId]);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "usuario",
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "user")}`,
      status: "online",
      unreadCount: 0,
      isFollowing: true,
    }));
  }

  async getMessages(friendId: string, currentUserId?: string): Promise<PrivateMessage[]> {
    if (!currentUserId) return [];
    const query = `
      SELECT * FROM direct_messages
      WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at ASC
    `;
    const { rows } = await this.pool.query(query, [currentUserId, friendId]);
    return rows.map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      content: r.content,
      type: r.message_type || "text",
      mediaUrl: r.media_url || undefined,
      timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: r.is_read,
    }));
  }

  async sendMessage(friendId: string, content: string, type: MessageType = "text", mediaUrl?: string, currentUserId?: string): Promise<PrivateMessage> {
    if (!currentUserId) throw new Error("Não autenticado");
    const { rows } = await this.pool.query(
      `INSERT INTO direct_messages (sender_id, recipient_id, content, media_url, message_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [currentUserId, friendId, content, mediaUrl || null, type]
    );
    const r = rows[0];
    return {
      id: r.id,
      senderId: r.sender_id,
      content: r.content,
      type: r.message_type,
      mediaUrl: r.media_url || undefined,
      timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };
  }

  async markMessagesAsRead(friendId: string, currentUserId?: string): Promise<void> {
    if (!currentUserId) return;
    await this.pool.query(
      "UPDATE direct_messages SET is_read = true WHERE sender_id = $1 AND recipient_id = $2",
      [friendId, currentUserId]
    );
  }

  async getGlobalNotificationCount(currentUserId?: string): Promise<number> {
    if (!currentUserId) return 0;
    const { rows } = await this.pool.query(
      "SELECT COUNT(*)::int as cnt FROM notifications WHERE user_id = $1 AND is_read = false",
      [currentUserId]
    );
    return rows[0]?.cnt || 0;
  }

  async removeFriendship(targetId: string, currentUserId?: string): Promise<boolean> {
    if (!currentUserId) return false;
    await this.pool.query(
      "DELETE FROM connections WHERE (follower_id = $1 AND following_id = $2) OR (follower_id = $2 AND following_id = $1)",
      [currentUserId, targetId]
    );
    return true;
  }

  async toggleCloseFriend(friendId: string): Promise<boolean> { return true; }
  async getFavoriteFriends(targetUserId?: string): Promise<Friend[]> { return []; }
}

