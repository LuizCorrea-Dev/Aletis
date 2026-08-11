import { Pool } from "pg";
import { IAtrioRepository, AtrioItem, AtrioList } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresAtrioRepository implements IAtrioRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async getItems(): Promise<AtrioItem[]> {
    const query = `
      SELECT i.*, pr.username as author_name, pr.avatar_url as author_avatar
      FROM atrio_items i
      LEFT JOIN profiles pr ON i.user_id = pr.id
      ORDER BY i.created_at DESC
    `;
    const { rows } = await this.pool.query(query);
    return rows.map((item) => ({
      id: item.id,
      dbId: item.id,
      authorId: item.user_id,
      authorName: item.author_name || "Artista",
      authorAvatar: item.author_avatar || "",
      title: item.title,
      url: item.url,
      color: "bg-emerald-500",
      description: item.description || undefined,
      vibes: item.vibes_count || 0,
    }));
  }

  async getItemsByIds(ids: string[]): Promise<AtrioItem[]> {
    if (!ids || ids.length === 0) return [];
    const query = `
      SELECT i.*, pr.username as author_name, pr.avatar_url as author_avatar
      FROM atrio_items i
      LEFT JOIN profiles pr ON i.user_id = pr.id
      WHERE i.id = ANY($1)
    `;
    const { rows } = await this.pool.query(query, [ids]);
    return rows.map((item) => ({
      id: item.id,
      dbId: item.id,
      authorId: item.user_id,
      authorName: item.author_name || "Artista",
      authorAvatar: item.author_avatar || "",
      title: item.title,
      url: item.url,
      color: "bg-emerald-500",
      description: item.description || undefined,
      vibes: item.vibes_count || 0,
    }));
  }

  async getUserItems(userId: string): Promise<AtrioItem[]> {
    const query = `
      SELECT i.*, pr.username as author_name, pr.avatar_url as author_avatar
      FROM atrio_items i
      LEFT JOIN profiles pr ON i.user_id = pr.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
    `;
    const { rows } = await this.pool.query(query, [userId]);
    return rows.map((item) => ({
      id: item.id,
      dbId: item.id,
      authorId: item.user_id,
      authorName: item.author_name || "Artista",
      authorAvatar: item.author_avatar || "",
      title: item.title,
      url: item.url,
      color: "bg-emerald-500",
      description: item.description || undefined,
      vibes: item.vibes_count || 0,
    }));
  }

  async addItem(
    item: Omit<AtrioItem, "id" | "vibes" | "authorId" | "authorName" | "authorAvatar" | "dbId">,
    userId?: string
  ): Promise<AtrioItem> {
    const targetUserId = userId || "00000000-0000-0000-0000-000000000000";

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

    const { rows } = await this.pool.query(
      `INSERT INTO atrio_items (user_id, title, description, url, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        targetUserId,
        item.title,
        item.description || null,
        item.url,
        JSON.stringify([]),
      ]
    );
    const data = rows[0];
    return {
      id: data.id,
      dbId: data.id,
      authorId: data.user_id,
      authorName: "Artista",
      authorAvatar: "",
      title: data.title,
      url: data.url,
      color: "bg-emerald-500",
      description: data.description || undefined,
      vibes: 0,
    };
  }

  async updateItem(id: string, updates: Partial<AtrioItem>, userId?: string): Promise<AtrioItem | null> {
    let query = `UPDATE atrio_items 
                 SET title = COALESCE($1, title), description = COALESCE($2, description), url = COALESCE($3, url)
                 WHERE id = $4`;
    const params: any[] = [updates.title, updates.description, updates.url, id];
    if (userId) {
      params.push(userId);
      query += ` AND user_id = $5`;
    }
    query += ` RETURNING *`;

    const { rows } = await this.pool.query(query, params);
    if (rows.length === 0) return null;
    const data = rows[0];
    return {
      id: data.id,
      dbId: data.id,
      authorId: data.user_id,
      authorName: "Artista",
      authorAvatar: "",
      title: data.title,
      url: data.url,
      color: "bg-emerald-500",
      description: data.description || undefined,
      vibes: data.vibes_count || 0,
    };
  }

  async deleteItem(id: string, userId?: string): Promise<boolean> {
    if (userId) {
      const { rows } = await this.pool.query("DELETE FROM atrio_items WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
      return rows.length > 0;
    }
    await this.pool.query("DELETE FROM atrio_items WHERE id = $1", [id]);
    return true;
  }

  async getLists(userId?: string): Promise<AtrioList[]> {
    if (!userId) return [];
    const query = `
      SELECT l.*, ARRAY_AGG(li.item_id) FILTER (WHERE li.item_id IS NOT NULL) as item_ids
      FROM atrio_lists l
      LEFT JOIN atrio_list_items li ON l.id = li.list_id
      LEFT JOIN atrio_list_collaborators lc ON l.id = lc.list_id
      WHERE l.user_id = $1 OR lc.user_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;
    const { rows } = await this.pool.query(query, [userId]);
    return rows.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description || undefined,
      tags: [],
      itemIds: l.item_ids || [],
      coverUrl: l.cover_url || undefined,
      createdAt: new Date(l.created_at).toISOString(),
    }));
  }

  async createList(name: string, description?: string, tags?: string[], userId?: string): Promise<AtrioList> {
    const { rows } = await this.pool.query(
      `INSERT INTO atrio_lists (user_id, name, cover_url) VALUES ($1, $2, $3) RETURNING *`,
      [userId || "00000000-0000-0000-0000-000000000000", name, null]
    );
    const data = rows[0];
    return {
      id: data.id,
      name: data.name,
      description: undefined,
      tags: [],
      itemIds: [],
      createdAt: new Date(data.created_at).toISOString(),
    };
  }

  async updateList(id: string, updates: { name?: string; description?: string; tags?: string[] }, userId?: string): Promise<boolean> {
    if (userId) {
      const { rows } = await this.pool.query("UPDATE atrio_lists SET name = COALESCE($1, name) WHERE id = $2 AND user_id = $3 RETURNING id", [updates.name, id, userId]);
      return rows.length > 0;
    }
    await this.pool.query("UPDATE atrio_lists SET name = COALESCE($1, name) WHERE id = $2", [updates.name, id]);
    return true;
  }

  async deleteList(id: string, userId?: string): Promise<boolean> {
    if (userId) {
      const { rows } = await this.pool.query("DELETE FROM atrio_lists WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
      return rows.length > 0;
    }
    await this.pool.query("DELETE FROM atrio_lists WHERE id = $1", [id]);
    return true;
  }

  async addItemToList(listId: string, itemId: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO atrio_list_items (list_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [listId, itemId]
    );
  }

  async removeItemFromList(listId: string, itemId: string): Promise<void> {
    await this.pool.query("DELETE FROM atrio_list_items WHERE list_id = $1 AND item_id = $2", [listId, itemId]);
  }

  async incrementVibes(itemId: string): Promise<void> {
    await this.pool.query("UPDATE atrio_items SET vibes_count = vibes_count + 1 WHERE id = $1", [itemId]);
  }

  async addCollaborator(listId: string, userId: string, permission: "VIEWER" | "EDITOR" = "VIEWER"): Promise<boolean> {
    await this.pool.query(
      "INSERT INTO atrio_list_collaborators (list_id, user_id, permission) VALUES ($1, $2, $3) ON CONFLICT (list_id, user_id) DO UPDATE SET permission = EXCLUDED.permission",
      [listId, userId, permission]
    );
    return true;
  }

  async removeCollaborator(listId: string, userId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM atrio_list_collaborators WHERE list_id = $1 AND user_id = $2", [listId, userId]);
    return true;
  }

  async getCollaborators(listId: string): Promise<any[]> {
    const query = `
      SELECT c.*, pr.username, pr.avatar_url
      FROM atrio_list_collaborators c
      JOIN profiles pr ON c.user_id = pr.id
      WHERE c.list_id = $1
    `;
    const { rows } = await this.pool.query(query, [listId]);
    return rows.map((r) => ({
      id: r.user_id,
      userId: r.user_id,
      name: r.username,
      username: r.username,
      avatarUrl: r.avatar_url,
      permission: r.permission,
    }));
  }
}

