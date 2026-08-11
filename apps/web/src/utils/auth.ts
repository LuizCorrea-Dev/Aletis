import { cookies } from "next/headers";
import { getDbPool } from "@aletis/infrastructure";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "aletis_session";
const SECRET = process.env.JWT_SECRET || "aletis_local_secret_key_2026_super_secure";

export interface LocalUserSession {
  id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SECRET, 1000, 64, "sha512").toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const inputHash = crypto.pbkdf2Sync(password, SECRET, 1000, 64, "sha512").toString("hex");
  return inputHash === hash;
}

export function signToken(payload: LocalUserSession): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + hmac;
}

export function verifyToken(token: string): LocalUserSession | null {
  try {
    const [base64Data, hmac] = token.split(".");
    if (!base64Data || !hmac) return null;

    const dataStr = Buffer.from(base64Data, "base64url").toString("utf8");
    const expectedHmac = crypto.createHmac("sha256", SECRET).update(dataStr).digest("hex");

    if (hmac !== expectedHmac) return null;

    const payload = JSON.parse(dataStr);
    if (payload.exp && Date.now() > payload.exp) return null;

    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      avatarUrl: payload.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function ensureUserExistsInDb(session: LocalUserSession): Promise<void> {
  if (!session || !session.id) return;
  try {
    const pool = getDbPool();
    const { rows } = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [session.id]);
    if (rows.length === 0) {
      const email = session.email || `${session.username || "user"}@aletis.app`;
      const username = session.username || email.split("@")[0];
      const avatarUrl = session.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;

      await pool.query(
        "INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
        [session.id, email.toLowerCase(), "session_autocreated", session.role || "user"]
      );

      await pool.query(
        `INSERT INTO profiles (id, username, display_name, full_name, avatar_url, vibes_balance)
         VALUES ($1, $2, $3, $4, $5, 50) ON CONFLICT (id) DO NOTHING`,
        [session.id, username.toLowerCase(), username, username, avatarUrl]
      );
    }
  } catch (err) {
    console.error("Erro ao auto-recuperar conta no banco de dados:", err);
  }
}

export async function getCurrentUser(): Promise<LocalUserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const session = verifyToken(token);
    if (session) {
      await ensureUserExistsInDb(session);

      try {
        const pool = getDbPool();
        const { rows } = await pool.query(
          "SELECT avatar_url, username, display_name FROM profiles WHERE id = $1 LIMIT 1",
          [session.id]
        );
        if (rows.length > 0) {
          if (rows[0].avatar_url) {
            session.avatarUrl = rows[0].avatar_url;
          }
          if (rows[0].username) {
            session.username = rows[0].username;
          }
        }
      } catch (dbErr) {
        console.error("Erro ao buscar foto atualizada do perfil:", dbErr);
      }
    }
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: LocalUserSession): Promise<void> {
  const token = signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
