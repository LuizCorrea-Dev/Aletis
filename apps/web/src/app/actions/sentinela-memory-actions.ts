"use server";

import { PostgresSentinelaMemoryRepository } from "@aletis/infrastructure";

const OLLAMA_HOST = process.env.OLLAMA_BASE_URL || "http://aletis_ollama:11434";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

/**
 * Chamada à API local do Ollama para gerar embedding vetorial de um texto
 */
async function generateLocalEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: text,
      }),
    });

    if (!res.ok) {
      console.error("Erro na API do Ollama Embeddings:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data.embedding || null;
  } catch (err) {
    console.error("Falha ao comunicar com motor Ollama local:", err);
    return null;
  }
}

/**
 * Server Action: Recebe um desabafo/post, gera o embedding localmente no Ollama,
 * e salva o vetor no PostgreSQL (pgvector) na tabela sentinela_user_memories.
 */
export async function processAndStoreDesabafoMemory(
  userId: string,
  desabafoContent: string,
  keyFacts: string[] = []
): Promise<{ success: boolean; message: string }> {
  try {
    if (!userId || !desabafoContent) {
      return { success: false, message: "Dados de desabafo ou usuário ausentes." };
    }

    // 1. Gera embedding do texto via Ollama Local
    const embeddingVector = await generateLocalEmbedding(desabafoContent);
    if (!embeddingVector) {
      return {
        success: false,
        message: "Não foi possível gerar os embeddings locais no Ollama.",
      };
    }

    // 2. Salva no PostgreSQL pgvector via repositório local
    const repository = new PostgresSentinelaMemoryRepository();
    const summary = desabafoContent.slice(0, 300); // Resumo sintético inicial

    const saved = await repository.saveUserMemoryWithEmbedding(
      userId,
      summary,
      keyFacts,
      embeddingVector
    );

    if (saved) {
      return {
        success: true,
        message: "Memória vetorial do Sentinela atualizada com sucesso no pgvector local!",
      };
    } else {
      return { success: false, message: "Erro ao gravar vetor no banco de dados local." };
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Erro inesperado ao processar memória." };
  }
}

/**
 * Server Action: Realiza busca semântica por proximidade de cosseno (<=>) no pgvector
 */
export async function searchSimilarDesabafos(
  queryText: string,
  limit: number = 5
) {
  try {
    const queryVector = await generateLocalEmbedding(queryText);
    if (!queryVector) return [];

    const repository = new PostgresSentinelaMemoryRepository();
    return await repository.searchSimilarMemories(queryVector, limit);
  } catch (err) {
    console.error("Erro na busca por semelhança RAG:", err);
    return [];
  }
}
