export interface SentinelaUserMemory {
  id: string;
  userId: string;
  summary: string;
  keyFacts: string[];
  updatedAt: string;
}

export interface ISentinelaMemoryRepository {
  /** Busca a memória histórica contínua de um usuário */
  getUserMemory(userId: string): Promise<SentinelaUserMemory | null>;

  /** Salva ou atualiza (upsert) a memória de longo prazo de um usuário */
  saveUserMemory(userId: string, summary: string, keyFacts?: string[]): Promise<boolean>;

  /** Salva a memória contínua com o vetor de Embeddings gerado pelo Ollama (pgvector) */
  saveUserMemoryWithEmbedding?(
    userId: string,
    summary: string,
    keyFacts: string[],
    embeddingVector: number[]
  ): Promise<boolean>;

  /** Busca semântica (RAG) no pgvector por Distância de Cosseno */
  searchSimilarMemories?(queryVector: number[], limit?: number): Promise<SentinelaUserMemory[]>;

  /** Busca o contexto completo do perfil (nome, email, telefone, posts, curtidas, comentários, VIBES) */
  getUserRichProfileContext?(userId: string): Promise<string>;

  /** Registra uma infração e aplica Time-Out com dedução de VIBES (-50 VIBES) */
  registerInfraction(userId: string, reason: string, vibesDeducted?: number): Promise<boolean>;

  /** Verifica se o usuário está em Time-Out ativo */
  isUserInTimeout(userId: string): Promise<boolean>;

  /** Exclui permanentemente a memória vetorial de um usuário */
  deleteUserMemory(userId: string): Promise<boolean>;
}
