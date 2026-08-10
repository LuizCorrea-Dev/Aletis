import { Pool } from "pg";
import { ITransactionRepository, TransactionResult, PostRewardResult } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresTransactionRepository implements ITransactionRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async getBalance(userId: string): Promise<number> {
    try {
      const { rows } = await this.pool.query(
        `SELECT vibes_balance, orvalho_balance, orvalho_expires_at,
                (orvalho_expires_at IS NOT NULL AND orvalho_expires_at > CURRENT_TIMESTAMP) as is_orvalho_active
         FROM profiles WHERE id = $1 LIMIT 1`,
        [userId]
      );

      if (!rows[0]) return 50;

      const vibes = rows[0].vibes_balance ?? 50;
      const orvalho = rows[0].is_orvalho_active ? (rows[0].orvalho_balance ?? 0) : 0;
      return vibes + orvalho;
    } catch {
      return 50;
    }
  }

  async logTransaction(
    userId: string,
    amount: number,
    type: string,
    relatedId?: string,
    description?: string
  ): Promise<boolean> {
    try {
      await this.pool.query(
        `INSERT INTO vibe_transactions (user_id, amount, type, related_id, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, amount, type, relatedId || null, description || null]
      );
      return true;
    } catch (err) {
      console.error("Erro ao registrar log de transação de Vibe:", err);
      return false;
    }
  }

  async processReward(type: "post" | "atrio" | "notice", userId?: string): Promise<TransactionResult> {
    if (!userId) return { success: false, newBalance: 0, message: "Usuário não informado" };

    await this.pool.query(
      "UPDATE profiles SET vibes_balance = vibes_balance + 1 WHERE id = $1",
      [userId]
    );
    await this.logTransaction(userId, 1, "POST_REWARD", undefined, "Recompensa por contribuição");

    const newBalance = await this.getBalance(userId);
    return {
      success: true,
      newBalance,
      message: "+1 Vibe! A tua contribuição foi registrada.",
    };
  }

  /**
   * Processa recompensas de um post:
   * - Orvalho do Dia: +6 VIBES TEMPORÁRIAS por 24h (no 1º post do dia civil)
   * - Post Reward: +1 VIBE PERMANENTE
   * - Media Reward: +1 VIBE PERMANENTE (se contiver mídia)
   */
  async processPostRewards(
    userId: string,
    hasMedia: boolean = false,
    postId?: string
  ): Promise<PostRewardResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Verifica se é o primeiro post do dia (Orvalho)
      const { rows } = await client.query(
        `SELECT vibes_balance, orvalho_balance, orvalho_expires_at, ultima_data_orvalho,
                (ultima_data_orvalho IS NULL OR ultima_data_orvalho < CURRENT_DATE) as is_first_today
         FROM profiles WHERE id = $1 FOR UPDATE`,
        [userId]
      );

      const profile = rows[0] || { is_first_today: true, vibes_balance: 50, orvalho_balance: 0 };
      const isFirstToday = Boolean(profile.is_first_today);

      const orvalhoVibes = isFirstToday ? 6 : 0;
      const postVibes = 1;
      const mediaVibes = hasMedia ? 1 : 0;
      const permanentVibes = postVibes + mediaVibes;
      const totalVibesGranted = orvalhoVibes + permanentVibes;

      // 2. Atualiza o saldo permanente e deposita Orvalho Temporário (24h)
      if (isFirstToday) {
        await client.query(
          `UPDATE profiles 
           SET vibes_balance = vibes_balance + $1,
               orvalho_balance = $2,
               orvalho_expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours',
               ultima_data_orvalho = CURRENT_DATE 
           WHERE id = $3`,
          [permanentVibes, orvalhoVibes, userId]
        );
      } else {
        await client.query(
          "UPDATE profiles SET vibes_balance = vibes_balance + $1 WHERE id = $2",
          [permanentVibes, userId]
        );
      }

      // 3. Grava histórico de transações
      if (orvalhoVibes > 0) {
        await client.query(
          "INSERT INTO vibe_transactions (user_id, amount, type, related_id, description) VALUES ($1, $2, 'DAILY_ORVALHO', $3, 'Orvalho do Dia (6 Vibes Temporárias por 24h)')",
          [userId, orvalhoVibes, postId || null]
        );
      }

      await client.query(
        "INSERT INTO vibe_transactions (user_id, amount, type, related_id, description) VALUES ($1, $2, 'POST_REWARD', $3, 'Recompensa permanente por desabafo')",
        [userId, postVibes, postId || null]
      );

      if (mediaVibes > 0) {
        await client.query(
          "INSERT INTO vibe_transactions (user_id, amount, type, related_id, description) VALUES ($1, $2, 'MEDIA_REWARD', $3, 'Bônus permanente por mídia')",
          [userId, mediaVibes, postId || null]
        );
      }

      const { rows: updatedRows } = await client.query(
        `SELECT vibes_balance, orvalho_balance, orvalho_expires_at,
                (orvalho_expires_at IS NOT NULL AND orvalho_expires_at > CURRENT_TIMESTAMP) as is_orvalho_active
         FROM profiles WHERE id = $1`,
        [userId]
      );

      const updatedProfile = updatedRows[0];
      const activeOrvalho = updatedProfile?.is_orvalho_active ? updatedProfile.orvalho_balance : 0;
      const newTotalBalance = (updatedProfile?.vibes_balance ?? 50) + activeOrvalho;

      await client.query("COMMIT");

      return {
        success: true,
        newBalance: newTotalBalance,
        message: isFirstToday
          ? `+${totalVibesGranted} VIBES recebidas! (+6 Orvalho Temporário 24h, +1 Post${hasMedia ? ", +1 Mídia" : ""})`
          : `+${permanentVibes} VIBE(s) permanente(s) recebida(s)! (+1 Post${hasMedia ? ", +1 Mídia" : ""})`,
        breakdown: {
          total: totalVibesGranted,
          orvalho: orvalhoVibes,
          post: postVibes,
          media: mediaVibes,
        },
      };
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Erro em processPostRewards:", err);
      const balance = await this.getBalance(userId);
      return {
        success: false,
        newBalance: balance,
        message: "Erro ao processar recompensas de Vibes.",
        breakdown: { total: 0, orvalho: 0, post: 0, media: 0 },
      };
    } finally {
      client.release();
    }
  }

  /**
   * Transferência Atômica de Vibes entre Usuários (Doações)
   * - Deduz prioritariamente do Orvalho temporário ativo de 24h do remetente.
   * - O destinatário SEMPRE recebe VIBES permanentes em seu vibes_balance.
   */
  async transferVibe(
    recipientId: string,
    amount: number = 1,
    postId?: string,
    commentId?: string,
    senderId?: string
  ): Promise<TransactionResult> {
    if (!senderId) return { success: false, newBalance: 0, message: "Remetente não informado." };
    if (senderId === recipientId) return { success: false, newBalance: await this.getBalance(senderId), message: "Você não pode doar Vibes para si mesmo." };

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Busca e bloqueia perfil do remetente
      const { rows } = await client.query(
        `SELECT vibes_balance, orvalho_balance, orvalho_expires_at,
                (orvalho_expires_at IS NOT NULL AND orvalho_expires_at > CURRENT_TIMESTAMP) as is_orvalho_active
         FROM profiles WHERE id = $1 FOR UPDATE`,
        [senderId]
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return { success: false, newBalance: 0, message: "Remetente não encontrado." };
      }

      const sender = rows[0];
      const activeOrvalho = sender.is_orvalho_active ? (sender.orvalho_balance ?? 0) : 0;
      const permanentVibes = sender.vibes_balance ?? 0;
      const totalAvailable = permanentVibes + activeOrvalho;

      if (totalAvailable < amount) {
        await client.query("ROLLBACK");
        return { success: false, newBalance: totalAvailable, message: "Saldo de Vibes insuficiente para esta doação." };
      }

      // 2. Calcula dedução: consome Orvalho temporário primeiro
      const orvalhoDeducted = Math.min(activeOrvalho, amount);
      const permanentDeducted = amount - orvalhoDeducted;

      const newOrvalhoBalance = activeOrvalho - orvalhoDeducted;
      const newPermanentBalance = permanentVibes - permanentDeducted;

      // 3. Atualiza o perfil do remetente (se o Orvalho tiver sido todo consumido ou expirado, pode resetar)
      await client.query(
        `UPDATE profiles 
         SET vibes_balance = $1,
             orvalho_balance = $2
         WHERE id = $3`,
        [newPermanentBalance, newOrvalhoBalance, senderId]
      );

      // 4. Credita VIBES PERMANENTES para o destinatário
      await client.query(
        "UPDATE profiles SET vibes_balance = vibes_balance + $1 WHERE id = $2",
        [amount, recipientId]
      );

      if (postId) {
        await client.query("UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1", [postId]);
      }

      // 5. Grava logs atômicos para remetente e destinatário
      await client.query(
        `INSERT INTO vibe_transactions (user_id, amount, type, related_id, description) VALUES 
         ($1, $2, 'TRANSFER_SENT', $3, $6),
         ($4, $5, 'TRANSFER_RECEIVED', $3, 'Vibe permanente recebida por apoio/doação')`,
        [
          senderId,
          -amount,
          postId || commentId || null,
          recipientId,
          amount,
          orvalhoDeducted > 0
            ? `Doação enviada (${orvalhoDeducted} Orvalho temporário + ${permanentDeducted} Permanente)`
            : "Doação enviada (Vibe Permanente)"
        ]
      );

      await client.query("COMMIT");

      return {
        success: true,
        newBalance: newPermanentBalance + newOrvalhoBalance,
        message: "Vibe enviada com sucesso!",
      };
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Erro em transferVibe:", err);
      const balance = await this.getBalance(senderId);
      return { success: false, newBalance: balance, message: err.message || "Erro na transferência de Vibe." };
    } finally {
      client.release();
    }
  }

  async processFollow(targetId: string, currentUserId?: string): Promise<TransactionResult> {
    if (!currentUserId) return { success: false, newBalance: 0, message: "Não autenticado" };
    await this.pool.query(
      "INSERT INTO connections (follower_id, following_id, status) VALUES ($1, $2, 'accepted') ON CONFLICT DO NOTHING",
      [currentUserId, targetId]
    );
    const balance = await this.getBalance(currentUserId);
    return { success: true, newBalance: balance, message: "Seguindo com sucesso!" };
  }

  async processUnfollow(targetId: string, currentUserId?: string): Promise<TransactionResult> {
    if (!currentUserId) return { success: false, newBalance: 0, message: "Não autenticado" };
    await this.pool.query("DELETE FROM connections WHERE follower_id = $1 AND following_id = $2", [currentUserId, targetId]);
    const balance = await this.getBalance(currentUserId);
    return { success: true, newBalance: balance, message: "Deixou de seguir." };
  }
}


