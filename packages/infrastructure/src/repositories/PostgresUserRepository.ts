import { Pool } from "pg";
import { IUserRepository, UserProfile, UpdateUserProfileData } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresUserRepository implements IUserRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async findByEmail(email: string): Promise<{ id: string; email: string; password_hash: string; username: string; role: string } | null> {
    try {
      const { rows } = await this.pool.query(
        `SELECT u.id, u.email, u.password_hash, u.role, p.username 
         FROM users u 
         LEFT JOIN profiles p ON p.id = u.id 
         WHERE LOWER(u.email) = LOWER($1) LIMIT 1`,
        [email]
      );
      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        email: rows[0].email,
        password_hash: rows[0].password_hash,
        username: rows[0].username || rows[0].email.split("@")[0],
        role: rows[0].role || "user",
      };
    } catch (err) {
      console.error("Erro no PostgresUserRepository.findByEmail:", err);
      return null;
    }
  }

  async createUser(data: { id: string; email: string; passwordHash: string; username: string; name: string; avatarUrl?: string }): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)");
      await client.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100)");
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
        [data.id, data.email, data.passwordHash, "user"]
      );
      await client.query(
        `INSERT INTO profiles (id, username, display_name, full_name, avatar_url, vibes_balance) 
         VALUES ($1, $2, $3, $4, $5, 50)`,
        [data.id, data.username, data.name, data.name, data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${data.username}`]
      );
      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Erro no PostgresUserRepository.createUser:", err);
      return false;
    } finally {
      client.release();
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { rows } = await this.pool.query(
        "SELECT * FROM profiles WHERE id = $1 LIMIT 1",
        [userId]
      );

      if (rows.length === 0) return null;
      const data = rows[0];

      return {
        id: data.id,
        name: data.display_name || data.full_name || "Membro Aletis",
        username: data.username,
        bio: data.bio || "",
        status: data.status || "Em busca de equilíbrio.",
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.username}`,
        bannerUrl: data.banner_url || "",
        vibes: data.vibes_balance ?? data.vibes ?? 50,
        vibeSaldoReal: data.vibes_balance ?? 50,
        vibeOrvalho: 0,
        ultimaDataOrvalho: null,
        autoridadeScore: 100,
        tier: data.tipo_perfil || "comum",
        tipoPerfil: data.tipo_perfil || "comum",
        perfilCompleto: true,
        phone: data.phone || "",
        countryCode: data.country_code || "+55",
        isAnonymousDefault: Boolean(data.is_anonymous_default),
        isSuspended: Boolean(data.is_suspended),
        lastUsernameChange: data.username_last_changed ? new Date(data.username_last_changed).toISOString() : null,
      };
    } catch (err) {
      console.error("Erro no PostgresUserRepository.getUserProfile:", err);
      return null;
    }
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { rows } = await this.pool.query(
        "SELECT * FROM profiles WHERE LOWER(username) = LOWER($1) LIMIT 1",
        [username.trim()]
      );

      if (rows.length === 0) return null;
      const data = rows[0];

      return {
        id: data.id,
        name: data.display_name || data.full_name || "Membro Aletis",
        username: data.username,
        bio: data.bio || "",
        status: data.status || "Em busca de equilíbrio.",
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.username}`,
        bannerUrl: data.banner_url || "",
        vibes: data.vibes_balance ?? data.vibes ?? 50,
        vibeSaldoReal: data.vibes_balance ?? 50,
        vibeOrvalho: 0,
        ultimaDataOrvalho: null,
        autoridadeScore: 100,
        tier: data.tipo_perfil || "comum",
        tipoPerfil: data.tipo_perfil || "comum",
        perfilCompleto: true,
        phone: data.phone || "",
        countryCode: data.country_code || "+55",
        isAnonymousDefault: Boolean(data.is_anonymous_default),
        isSuspended: Boolean(data.is_suspended),
        lastUsernameChange: data.username_last_changed ? new Date(data.username_last_changed).toISOString() : null,
      };
    } catch (err) {
      console.error("Erro no PostgresUserRepository.getProfileByUsername:", err);
      return null;
    }
  }

  async updateUserProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<{ success: boolean; message: string; data?: UserProfile }> {
    try {
      const current = await this.getUserProfile(userId);
      let newUsername = current?.username || "";
      let lastUsernameChange = current?.lastUsernameChange || null;

      if (data.username && current && current.username.toLowerCase().trim() !== data.username.toLowerCase().trim()) {
        newUsername = data.username.toLowerCase().trim();
        lastUsernameChange = new Date().toISOString();
      }

      await this.pool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false");
      await this.pool.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_anonymous_default BOOLEAN DEFAULT false");

      const query = `
        UPDATE profiles 
        SET display_name = $1, full_name = $1, bio = $2, status = $3, avatar_url = $4, banner_url = $5,
            phone = $6, country_code = $7, username = $8, username_last_changed = $9,
            is_anonymous_default = COALESCE($10, is_anonymous_default),
            is_suspended = COALESCE($11, is_suspended),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
      `;

      const { rows } = await this.pool.query(query, [
        data.name,
        data.bio || "",
        data.status || "",
        data.avatarUrl || "",
        data.bannerUrl || "",
        data.phone || "",
        data.countryCode || "+55",
        newUsername,
        lastUsernameChange,
        data.isAnonymousDefault ?? null,
        data.isSuspended ?? null,
        userId,
      ]);

      if (rows.length === 0) {
        return { success: false, message: "Perfil não encontrado para atualização." };
      }

      const row = rows[0];
      return {
        success: true,
        message: "Perfil atualizado com sucesso!",
        data: {
          id: row.id,
          name: row.display_name || row.full_name || "Membro Aletis",
          username: row.username,
          bio: row.bio || "",
          status: row.status || "",
          avatarUrl: row.avatar_url || "",
          bannerUrl: row.banner_url || "",
          vibes: row.vibes_balance ?? 50,
          vibeSaldoReal: row.vibes_balance ?? 50,
          vibeOrvalho: 0,
          autoridadeScore: 100,
          tier: row.tipo_perfil || "comum",
          tipoPerfil: row.tipo_perfil || "comum",
          perfilCompleto: true,
          phone: row.phone || "",
          countryCode: row.country_code || "+55",
          isAnonymousDefault: Boolean(row.is_anonymous_default),
          isSuspended: Boolean(row.is_suspended),
          lastUsernameChange: row.username_last_changed ? new Date(row.username_last_changed).toISOString() : null,
        },
      };
    } catch (err: any) {
      console.error("Erro no PostgresUserRepository.updateUserProfile:", err);
      return { success: false, message: err?.message || "Erro ao atualizar perfil." };
    }
  }

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const trimmedExclude = excludeUserId?.trim();
      if (trimmedExclude) {
        const { rows } = await this.pool.query(
          "SELECT id FROM profiles WHERE LOWER(username) = LOWER($1) AND id <> $2 LIMIT 1",
          [username.trim(), trimmedExclude]
        );
        return rows.length === 0;
      } else {
        const { rows } = await this.pool.query(
          "SELECT id FROM profiles WHERE LOWER(username) = LOWER($1) LIMIT 1",
          [username.trim()]
        );
        return rows.length === 0;
      }
    } catch (err) {
      console.error("Erro no PostgresUserRepository.isUsernameAvailable:", err);
      return false;
    }
  }

  async getUsernameLastChange(userId: string): Promise<Date | null> {
    try {
      const { rows } = await this.pool.query(
        "SELECT username_last_changed FROM profiles WHERE id = $1 LIMIT 1",
        [userId]
      );
      if (rows.length === 0 || !rows[0].username_last_changed) return null;
      return new Date(rows[0].username_last_changed);
    } catch (err) {
      console.error("Erro no PostgresUserRepository.getUsernameLastChange:", err);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.pool.query("DELETE FROM users WHERE id = $1", [userId]);
      return true;
    } catch (err) {
      console.error("Erro no PostgresUserRepository.deleteUser:", err);
      return false;
    }
  }
}
