"use server";

import { getCurrentUser } from "@/utils/auth";
import { PostgresConnectionRepository, PostgresSentinelaMemoryRepository } from "@aletis/infrastructure";
import { DualBrainSentinelaService } from "@aletis/application";
import { PrivateMessage } from "@aletis/domain";

const SENTINELA_BOT_ID = "00000000-0000-0000-0000-000000000001";

export async function sendSentinelaChatMessageAction(content: string): Promise<{
  success: boolean;
  message?: string;
  userMsg?: PrivateMessage;
  botMsg?: PrivateMessage;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    if (!content || !content.trim()) {
      return { success: false, message: "Mensagem em branco." };
    }

    const connRepo = new PostgresConnectionRepository();
    const memoryRepo = new PostgresSentinelaMemoryRepository();

    // 1. Salva a mensagem do usuário enviada para o Sentinela
    let userMsg: PrivateMessage;
    try {
      userMsg = await connRepo.sendMessage(SENTINELA_BOT_ID, content.trim(), "text", undefined, user.id);
    } catch {
      userMsg = {
        id: Date.now().toString(),
        senderId: user.id,
        content: content.trim(),
        type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };
    }

    let userName = user.username;
    try {
      const pool = (connRepo as any).pool;
      if (pool) {
        const { rows } = await pool.query(
          "SELECT display_name, username FROM profiles WHERE id = $1 LIMIT 1",
          [user.id]
        );
        if (rows.length > 0 && rows[0].display_name) {
          userName = rows[0].display_name;
        }
      }
    } catch {}

    // 2. Processa com a inteligência Dual-Brain do Sentinela (DeepSeek + Llama + RAG pgvector)
    const dualBrain = new DualBrainSentinelaService(
      memoryRepo,
      process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      process.env.OLLAMA_BRAIN_REASONING_MODEL || "deepseek-r1:1.5b",
      process.env.OLLAMA_BRAIN_MENTOR_MODEL || "llama3.2",
      process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text"
    );

    const result = await dualBrain.processInteraction(content.trim(), user.id, true, userName);

    let responseText = "";
    if (!result.safe) {
      responseText = result.reason || "O Sentinela identificou conteúdo violador das diretrizes.";
    } else if (result.isCrisis) {
      responseText = "Você não está sozinho. Se você estiver passando por um momento de dor ou crise, por favor ligue para o CVV 188 (Brasil) ou SAMU 192. Estamos aqui com você.";
    } else {
      responseText = result.mentorSuggestion || "Estou aqui te ouvindo. Conte-me mais sobre como você está se sentindo sobre isso.";
    }

    // 3. Persiste e retorna a resposta empática do Sentinela
    let botMsg: PrivateMessage;
    try {
      const pool = (connRepo as any).pool;
      const { rows } = await pool.query(
        `INSERT INTO direct_messages (sender_id, recipient_id, content, message_type, is_read)
         VALUES ($1, $2, $3, 'text', true)
         RETURNING *`,
        [SENTINELA_BOT_ID, user.id, responseText]
      );
      const r = rows[0];
      botMsg = {
        id: r.id,
        senderId: SENTINELA_BOT_ID,
        content: responseText,
        type: "text",
        timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };
    } catch {
      botMsg = {
        id: (Date.now() + 1).toString(),
        senderId: SENTINELA_BOT_ID,
        content: responseText,
        type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };
    }

    return {
      success: true,
      userMsg,
      botMsg,
    };
  } catch (error: any) {
    console.error("Erro no sendSentinelaChatMessageAction:", error);
    return { success: false, message: "Erro ao processar mensagem com o Sentinela." };
  }
}
