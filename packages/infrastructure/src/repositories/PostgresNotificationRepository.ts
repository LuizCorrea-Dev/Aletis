import { Pool } from "pg";
import { INotificationRepository, NotificationItem, CreateNotificationInput } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresNotificationRepository implements INotificationRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const query = `
        SELECT n.*, pr.username as actor_name, pr.avatar_url as actor_avatar
        FROM notifications n
        LEFT JOIN profiles pr ON n.actor_id = pr.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 50
      `;
      const { rows } = await this.pool.query(query, [userId]);
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        actorId: r.actor_id,
        type: r.type,
        title: r.title || "Notificação",
        content: r.content || "",
        linkUrl: r.link_url || "/",
        isRead: Boolean(r.is_read),
        avatarUrl: r.actor_avatar || undefined,
        createdAt: new Date(r.created_at).toISOString(),
      }));
    } catch (err) {
      console.error("Erro ao buscar notificações do usuário:", err);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { rows } = await this.pool.query(
        "SELECT COUNT(*)::int as cnt FROM notifications WHERE user_id = $1 AND is_read = false",
        [userId]
      );
      return rows[0]?.cnt || 0;
    } catch (err) {
      console.error("Erro ao contar notificações não lidas:", err);
      return 0;
    }
  }

  async createNotification(input: CreateNotificationInput): Promise<NotificationItem | null> {
    try {
      // Previne auto-notificação (não notificar a si mesmo)
      if (input.actorId && input.actorId === input.userId) {
        return null;
      }

      const { rows } = await this.pool.query(
        `INSERT INTO notifications (user_id, actor_id, type, title, content, link_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [input.userId, input.actorId || null, input.type, input.title, input.content, input.linkUrl || "/"]
      );

      const r = rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        actorId: r.actor_id,
        type: r.type,
        title: r.title,
        content: r.content,
        linkUrl: r.link_url,
        isRead: Boolean(r.is_read),
        createdAt: new Date(r.created_at).toISOString(),
      };
    } catch (err) {
      console.error("Erro ao criar notificação:", err);
      return null;
    }
  }

  async markAsRead(userId: string, notificationId?: string): Promise<boolean> {
    try {
      if (notificationId) {
        await this.pool.query(
          "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
          [notificationId, userId]
        );
      } else {
        await this.pool.query(
          "UPDATE notifications SET is_read = true WHERE user_id = $1",
          [userId]
        );
      }
      return true;
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas:", err);
      return false;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.pool.query(
        "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
        [notificationId, userId]
      );
      return true;
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
      return false;
    }
  }
}
