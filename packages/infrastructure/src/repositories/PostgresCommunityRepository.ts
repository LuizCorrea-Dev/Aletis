import { Pool } from "pg";
import {
  ICommunityRepository,
  Community,
  Channel,
  CommunityMessage,
  CommunityMember,
  CreateCommunityInput,
  UpdateCommunityInput,
  CreateChannelInput,
  RoleType,
} from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresCommunityRepository implements ICommunityRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  private mapRow(row: any, role: RoleType | null, memberCount: number): Community {
    return {
      id: row.id,
      name: row.name,
      description: row.description || "",
      bannerUrl: row.banner_url || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
      avatarUrl: row.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      privacy: row.privacy || "PUBLIC",
      memberCount,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
      isMember: role === "OWNER" || role === "MODERATOR" || role === "MEMBER",
      currentUserRole: role,
      isSuspended: row.is_suspended ?? false,
      welcomeMessage: row.welcome_message,
      inviteCode: row.invite_code,
    };
  }

  private async getMemberCount(communityId: string): Promise<number> {
    const { rows } = await this.pool.query(
      "SELECT COUNT(*)::int as cnt FROM community_members WHERE community_id = $1 AND role NOT IN ('PENDING', 'REJECTED')",
      [communityId]
    );
    return rows[0]?.cnt || 0;
  }

  async getCommunities(query?: string, currentUserId?: string): Promise<Community[]> {
    let sql = "SELECT * FROM communities WHERE 1=1";
    const params: any[] = [];

    if (query) {
      params.push(`%${query}%`);
      sql += ` AND LOWER(name) LIKE LOWER($${params.length})`;
    }

    sql += " ORDER BY created_at DESC";
    const { rows } = await this.pool.query(sql, params);

    const myRoles = new Map<string, RoleType>();
    if (currentUserId) {
      const { rows: mems } = await this.pool.query(
        "SELECT community_id, role FROM community_members WHERE user_id = $1",
        [currentUserId]
      );
      mems.forEach((m) => myRoles.set(m.community_id, m.role as RoleType));
    }

    const results = await Promise.all(
      rows.map(async (row) => {
        const role = myRoles.get(row.id) ?? null;
        if (row.is_suspended && role !== "OWNER" && role !== "MODERATOR") return null;
        const count = await this.getMemberCount(row.id);
        return this.mapRow(row, role, count);
      })
    );

    return results.filter((c): c is Community => c !== null);
  }

  async getCommunityById(id: string, currentUserId?: string): Promise<Community | undefined> {
    const { rows } = await this.pool.query("SELECT * FROM communities WHERE id = $1 LIMIT 1", [id]);
    if (rows.length === 0) return undefined;

    let role: RoleType | null = null;
    if (currentUserId) {
      const { rows: mems } = await this.pool.query(
        "SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1",
        [id, currentUserId]
      );
      if (mems.length > 0) role = mems[0].role as RoleType;
    }

    const count = await this.getMemberCount(id);
    return this.mapRow(rows[0], role, count);
  }

  async getCommunityByInviteCode(code: string): Promise<Community | undefined> {
    const { rows } = await this.pool.query("SELECT * FROM communities WHERE invite_code = $1 LIMIT 1", [code]);
    if (rows.length === 0) return undefined;
    const count = await this.getMemberCount(rows[0].id);
    return this.mapRow(rows[0], null, count);
  }

  async generateInviteLink(communityId: string): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    await this.pool.query("UPDATE communities SET invite_code = $1 WHERE id = $2", [code, communityId]);
    return code;
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    const query = `
      SELECT cm.role, c.*
      FROM community_members cm
      JOIN communities c ON cm.community_id = c.id
      WHERE cm.user_id = $1 AND cm.role NOT IN ('PENDING', 'REJECTED')
      ORDER BY c.created_at DESC
    `;
    const { rows } = await this.pool.query(query, [userId]);
    return rows.map((r) => this.mapRow(r, r.role as RoleType, 0));
  }

  // ─── Channels ─────────────────────────────────────────────────────────────────

  async getChannels(communityId: string): Promise<Channel[]> {
    let { rows } = await this.pool.query(
      "SELECT * FROM community_channels WHERE community_id = $1 ORDER BY created_at ASC",
      [communityId]
    );

    if (rows.length === 0) {
      await this.pool.query(
        `INSERT INTO community_channels (community_id, name, type, is_private, topic) VALUES
         ($1, 'Mural de Avisos', 'announcements', false, 'Avisos oficiais'),
         ($1, 'Geral', 'text', false, 'Bate-papo da comunidade'),
         ($1, 'Voz', 'voice', false, 'Canal de áudio')`,
        [communityId]
      );
      const res = await this.pool.query(
        "SELECT * FROM community_channels WHERE community_id = $1 ORDER BY created_at ASC",
        [communityId]
      );
      rows = res.rows;
    }

    return rows.map((c) => ({
      id: c.id,
      communityId: c.community_id,
      name: c.name,
      type: c.type || "text",
      isPrivate: c.is_private || false,
      isAnnouncements: c.name === "Mural de Avisos",
      accessLevel: c.is_private ? "PRIVATE" : "PUBLIC",
      topic: c.topic || "",
      hasUnread: false,
    }));
  }

  async createChannel(input: CreateChannelInput): Promise<Channel> {
    const { rows } = await this.pool.query(
      "INSERT INTO community_channels (community_id, name, type, is_private, topic) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [input.communityId, input.name, input.type || "CHAT", input.isPrivate || false, input.topic || ""]
    );
    const c = rows[0];
    return {
      id: c.id,
      communityId: c.community_id,
      name: c.name,
      type: c.type,
      isPrivate: c.is_private,
      isAnnouncements: c.name === "Mural de Avisos",
      accessLevel: c.is_private ? "PRIVATE" : "PUBLIC",
      topic: c.topic || "",
      hasUnread: false,
    };
  }

  async updateChannel(
    channelId: string,
    updates: { name?: string; topic?: string; isPrivate?: boolean; type?: string }
  ): Promise<boolean> {
    await this.pool.query(
      `UPDATE community_channels 
       SET name = COALESCE($1, name), 
           topic = COALESCE($2, topic), 
           is_private = COALESCE($3, is_private), 
           type = COALESCE($4, type) 
       WHERE id = $5`,
      [updates.name || null, updates.topic || null, updates.isPrivate ?? null, updates.type || null, channelId]
    );
    return true;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM community_channels WHERE id = $1", [channelId]);
    return true;
  }

  async updateChannelAccess(channelId: string, accessLevel: "PUBLIC" | "PRIVATE" | "STAFF_ONLY"): Promise<boolean> {
    await this.pool.query("UPDATE community_channels SET is_private = $1 WHERE id = $2", [accessLevel !== "PUBLIC", channelId]);
    return true;
  }

  async markChannelAsRead(channelId: string): Promise<void> {}

  // ─── Messages ─────────────────────────────────────────────────────────────────

  async getMessages(channelId: string): Promise<CommunityMessage[]> {
    const query = `
      SELECT m.*, pr.username as author_name, pr.avatar_url as author_avatar
      FROM channel_messages m
      LEFT JOIN profiles pr ON m.author_id = pr.id
      WHERE m.channel_id = $1
      ORDER BY m.created_at ASC
    `;
    const { rows } = await this.pool.query(query, [channelId]);
    return rows.map((m) => ({
      id: m.id,
      channelId: m.channel_id,
      userId: m.author_id,
      userName: m.author_name || "Usuário",
      userAvatar: m.author_avatar || "",
      content: m.content,
      mediaUrl: m.media_url,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      vibes: 0,
      type: m.media_url ? "image" : "text",
      isPinned: m.is_pinned || false,
      isHighlighted: false,
    }));
  }

  async sendMessage(channelId: string, content: string, mediaUrl?: string, authorId?: string): Promise<CommunityMessage> {
    const { rows } = await this.pool.query(
      `INSERT INTO channel_messages (channel_id, author_id, content, media_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [channelId, authorId || "00000000-0000-0000-0000-000000000000", content, mediaUrl || null]
    );
    const m = rows[0];
    return {
      id: m.id,
      channelId: m.channel_id,
      userId: m.author_id,
      userName: "Você",
      userAvatar: "",
      content: m.content,
      mediaUrl: m.media_url,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      vibes: 0,
      type: m.media_url ? "image" : "text",
      isPinned: false,
      isHighlighted: false,
    };
  }

  async updateMessage(channelId: string, messageId: string, newContent: string, authorId?: string): Promise<boolean> {
    if (authorId) {
      await this.pool.query(
        "UPDATE channel_messages SET content = $1 WHERE id = $2 AND channel_id = $3 AND author_id = $4",
        [newContent, messageId, channelId, authorId]
      );
    } else {
      await this.pool.query(
        "UPDATE channel_messages SET content = $1 WHERE id = $2 AND channel_id = $3",
        [newContent, messageId, channelId]
      );
    }
    return true;
  }

  async deleteMessage(channelId: string, messageId: string, userId?: string): Promise<boolean> {
    if (userId) {
      // Deleta se for autor ou se for moderador/dono da comunidade
      await this.pool.query(
        `DELETE FROM channel_messages 
         WHERE id = $1 AND (
           author_id = $2 OR EXISTS (
             SELECT 1 FROM community_channels cc 
             JOIN community_members cm ON cm.community_id = cc.community_id 
             WHERE cc.id = $3 AND cm.user_id = $2 AND cm.role IN ('OWNER', 'MODERATOR')
           )
         )`,
        [messageId, userId, channelId]
      );
    } else {
      await this.pool.query("DELETE FROM channel_messages WHERE id = $1", [messageId]);
    }
    return true;
  }

  async togglePinMessage(channelId: string, messageId: string): Promise<boolean> {
    await this.pool.query("UPDATE channel_messages SET is_pinned = NOT is_pinned WHERE id = $1", [messageId]);
    return true;
  }


  async toggleHighlightMessage(channelId: string, messageId: string): Promise<boolean> {
    return true;
  }

  // ─── Members ──────────────────────────────────────────────────────────────────

  async getMembers(communityId: string): Promise<CommunityMember[]> {
    const query = `
      SELECT cm.*, pr.username, pr.avatar_url
      FROM community_members cm
      LEFT JOIN profiles pr ON cm.user_id = pr.id
      WHERE cm.community_id = $1
    `;
    const { rows } = await this.pool.query(query, [communityId]);
    return rows.map((m) => ({
      userId: m.user_id,
      name: m.username || "Usuário",
      avatar: m.avatar_url || "",
      role: m.role as RoleType,
      allowText: true,
      allowLinks: true,
      allowVideos: true,
      allowPhotos: true,
    }));
  }

  async updateMemberPermissions(communityId: string, userId: string, permissions: any): Promise<boolean> {
    return true;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async createCommunity(input: CreateCommunityInput, ownerId?: string): Promise<Community> {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const { rows } = await this.pool.query(
      `INSERT INTO communities (name, slug, description, privacy, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.name, slug, input.description || "", input.privacy || "PUBLIC", ownerId || "00000000-0000-0000-0000-000000000000"]
    );
    const comm = rows[0];

    await this.pool.query(
      "INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'OWNER')",
      [comm.id, comm.owner_id]
    );

    await this.getChannels(comm.id);

    return this.mapRow(comm, "OWNER", 1);
  }

  async updateCommunity(id: string, updates: UpdateCommunityInput): Promise<void> {
    await this.pool.query(
      `UPDATE communities 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           avatar_url = COALESCE($3, avatar_url), 
           banner_url = COALESCE($4, banner_url),
           privacy = COALESCE($5, privacy) 
       WHERE id = $6`,
      [updates.name || null, updates.description || null, updates.avatarUrl || null, updates.bannerUrl || null, (updates as any).privacy || null, id]
    );
  }


  async deleteCommunity(communityId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM communities WHERE id = $1", [communityId]);
    return true;
  }

  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; role: RoleType }> {
    const { rows: comms } = await this.pool.query("SELECT privacy FROM communities WHERE id = $1", [communityId]);
    if (comms.length === 0) return { success: false, role: "MEMBER" };

    const initialRole: RoleType = comms[0].privacy === "PRIVATE" ? "PENDING" : "MEMBER";
    await this.pool.query(
      `INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, $3)
       ON CONFLICT (community_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [communityId, userId, initialRole]
    );
    return { success: true, role: initialRole };
  }

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND role <> 'OWNER'", [communityId, userId]);
    return true;
  }

  async approveAccess(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("UPDATE community_members SET role = 'MEMBER' WHERE community_id = $1 AND user_id = $2", [communityId, userId]);
    return true;
  }

  async rejectAccess(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("UPDATE community_members SET role = 'REJECTED' WHERE community_id = $1 AND user_id = $2", [communityId, userId]);
    return true;
  }

  async undoRejectAccess(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("UPDATE community_members SET role = 'PENDING' WHERE community_id = $1 AND user_id = $2", [communityId, userId]);
    return true;
  }

  async kickMember(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND role <> 'OWNER'", [communityId, userId]);
    return true;
  }

  async updateMemberRole(communityId: string, userId: string, newRole: RoleType): Promise<{ success: boolean; message: string }> {
    await this.pool.query("UPDATE community_members SET role = $1 WHERE community_id = $2 AND user_id = $3", [newRole, communityId, userId]);
    return { success: true, message: "Cargo atualizado" };
  }

  async acceptModeration(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("UPDATE community_members SET role = 'MODERATOR' WHERE community_id = $1 AND user_id = $2", [communityId, userId]);
    return true;
  }

  async getRoles(communityId: string): Promise<any[]> { return []; }
  async createRole(communityId: string, roleData: any): Promise<any> { return null; }
  async updateRole(roleId: string, updates: any): Promise<boolean> { return true; }
  async deleteRole(roleId: string): Promise<boolean> { return true; }
  async assignMemberRole(communityId: string, userId: string, roleId: string): Promise<boolean> { return true; }
  async setMemberNickname(communityId: string, userId: string, nickname: string): Promise<boolean> { return true; }
  async banMember(communityId: string, userId: string, reason?: string): Promise<boolean> {
    await this.pool.query("DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND role <> 'OWNER'", [communityId, userId]);
    await this.pool.query(
      "INSERT INTO community_banned_members (community_id, user_id, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [communityId, userId, reason || "Violação de regras"]
    );
    return true;
  }

  async unbanMember(communityId: string, userId: string): Promise<boolean> {
    await this.pool.query("DELETE FROM community_banned_members WHERE community_id = $1 AND user_id = $2", [communityId, userId]);
    return true;
  }

  async getBannedMembers(communityId: string): Promise<any[]> {
    const query = `
      SELECT b.*, pr.username, pr.avatar_url
      FROM community_banned_members b
      JOIN profiles pr ON b.user_id = pr.id
      WHERE b.community_id = $1
    `;
    const { rows } = await this.pool.query(query, [communityId]);
    return rows.map((r) => ({
      userId: r.user_id,
      name: r.username,
      avatar: r.avatar_url,
      reason: r.reason,
      bannedAt: r.created_at,
    }));
  }

  async muteMember(communityId: string, userId: string, durationMinutes: number, reason?: string): Promise<boolean> { return true; }
  async unmuteMember(communityId: string, userId: string): Promise<boolean> { return true; }
  async getMutedMembers(communityId: string): Promise<any[]> { return []; }
  async createPoll(communityId: string, question: string, options: string[], channelId?: string, durationHours?: number): Promise<any> { return null; }

  async votePoll(pollId: string, optionIndex: number): Promise<boolean> { return true; }
  async getPolls(communityId: string, channelId?: string): Promise<any[]> { return []; }
}
