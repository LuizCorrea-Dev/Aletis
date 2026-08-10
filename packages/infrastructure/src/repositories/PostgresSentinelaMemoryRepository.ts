import { Pool } from "pg";
import { ISentinelaMemoryRepository, SentinelaUserMemory } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresSentinelaMemoryRepository implements ISentinelaMemoryRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  async getUserMemory(userId: string): Promise<SentinelaUserMemory | null> {
    try {
      const { rows } = await this.pool.query(
        "SELECT * FROM sentinela_user_memories WHERE user_id = $1 LIMIT 1",
        [userId]
      );
      if (rows.length === 0) return null;

      const data = rows[0];
      return {
        id: data.id,
        userId: data.user_id,
        summary: data.summary,
        keyFacts: typeof data.key_facts === "string" ? JSON.parse(data.key_facts) : data.key_facts || [],
        updatedAt: new Date(data.updated_at).toISOString(),
      };
    } catch {
      return null;
    }
  }

  async saveUserMemory(userId: string, summary: string, keyFacts: string[] = []): Promise<boolean> {
    try {
      const query = `
        INSERT INTO sentinela_user_memories (user_id, summary, key_facts, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET summary = EXCLUDED.summary, key_facts = EXCLUDED.key_facts, updated_at = CURRENT_TIMESTAMP
      `;
      await this.pool.query(query, [userId, summary, JSON.stringify(keyFacts)]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Salva a memória contínua com o vetor de Embeddings gerado pelo Ollama (pgvector)
   */
  async saveUserMemoryWithEmbedding(
    userId: string,
    summary: string,
    keyFacts: string[],
    embeddingVector: number[]
  ): Promise<boolean> {
    try {
      const vectorStr = `[${embeddingVector.join(",")}]`;
      const query = `
        INSERT INTO sentinela_user_memories (user_id, summary, key_facts, embedding, updated_at)
        VALUES ($1, $2, $3, $4::vector, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          summary = EXCLUDED.summary, 
          key_facts = EXCLUDED.key_facts, 
          embedding = EXCLUDED.embedding, 
          updated_at = CURRENT_TIMESTAMP
      `;
      await this.pool.query(query, [userId, summary, JSON.stringify(keyFacts), vectorStr]);
      return true;
    } catch (err) {
      console.error("Erro ao salvar memória com pgvector:", err);
      return false;
    }
  }

  /**
   * Busca semântica (RAG) no pgvector por Distância de Cosseno (<=>)
   */
  async searchSimilarMemories(queryVector: number[], limit: number = 5): Promise<SentinelaUserMemory[]> {
    try {
      const vectorStr = `[${queryVector.join(",")}]`;
      const query = `
        SELECT id, user_id, summary, key_facts, updated_at, (embedding <=> $1::vector) as distance
        FROM sentinela_user_memories
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $2
      `;
      const { rows } = await this.pool.query(query, [vectorStr, limit]);
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        summary: r.summary,
        keyFacts: typeof r.key_facts === "string" ? JSON.parse(r.key_facts) : r.key_facts || [],
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
    } catch (err) {
      console.error("Erro ao buscar memórias similares no pgvector:", err);
      return [];
    }
  }

  async registerInfraction(userId: string, reason: string, vibesDeducted: number = 50): Promise<boolean> {
    try {
      await this.pool.query(
        "INSERT INTO sentinela_timeouts (user_id, reason, vibes_deducted, is_active) VALUES ($1, $2, $3, true)",
        [userId, reason, vibesDeducted]
      );
      await this.pool.query(
        "UPDATE profiles SET vibes_balance = vibes_balance - $1 WHERE id = $2",
        [vibesDeducted, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async isUserInTimeout(userId: string): Promise<boolean> {
    try {
      const { rows } = await this.pool.query(
        "SELECT id FROM sentinela_timeouts WHERE user_id = $1 AND is_active = true LIMIT 1",
        [userId]
      );
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  async deleteUserMemory(userId: string): Promise<boolean> {
    try {
      await this.pool.query(
        "DELETE FROM sentinela_user_memories WHERE user_id = $1",
        [userId]
      );
      return true;
    } catch (err) {
      console.error("Erro ao deletar memória vetorial do usuário:", err);
      return false;
    }
  }
}
