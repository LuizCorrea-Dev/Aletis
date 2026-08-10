import { ISentinelaMemoryRepository } from "@aletis/domain";

export interface DualBrainModerationResult {
  safe: boolean;
  isCrisis?: boolean;
  reason?: string;
  mentorSuggestion?: string;
}

export class DualBrainSentinelaService {
  private ollamaBaseUrl: string;
  private reasoningModel: string;
  private mentorModel: string;
  private embedModel: string;

  constructor(
    private readonly memoryRepository?: ISentinelaMemoryRepository,
    ollamaBaseUrl?: string,
    reasoningModel?: string,
    mentorModel?: string,
    embedModel?: string
  ) {
    this.ollamaBaseUrl = ollamaBaseUrl !== undefined ? ollamaBaseUrl : (process.env.OLLAMA_BASE_URL || "http://localhost:11434");

    this.reasoningModel = reasoningModel || process.env.OLLAMA_BRAIN_REASONING_MODEL || "deepseek-r1:1.5b";
    this.mentorModel = mentorModel || process.env.OLLAMA_BRAIN_MENTOR_MODEL || "llama3.2";
    this.embedModel = embedModel || process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
  }

  /**
   * Limpa blocos de pensamento do DeepSeek-R1 (<think>...</think>)
   */
  private cleanAiResponse(raw: string): string {
    if (!raw) return "";
    return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }

  /**
   * Gera embedding local de 768 dimensões usando nomic-embed-text via Ollama API local ($0 / 100% Offline)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${this.ollamaBaseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify({
          model: this.embedModel,
          prompt: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.embedding ?? [];
      }
    } catch (err: any) {
      console.warn("Aviso ao gerar embedding local Ollama:", err?.message ?? err);
    }
    return [];
  }

  /**
   * Executa a análise Dual-Brain (DeepSeek + Llama) com memória contínua no pgvector
   */
  async processInteraction(
    content: string,
    userId?: string
  ): Promise<DualBrainModerationResult> {
    let userContext = "";

    // 1. RAG Semântico: Busca histórico de memória contínua no pgvector
    if (userId && this.memoryRepository) {
      const existingMem = await this.memoryRepository.getUserMemory(userId);
      if (existingMem) {
        userContext = existingMem.summary;
      }
    }

    // 2. CÉREBRO 1 (DeepSeek-R1 Local): Moderação & Raciocínio de Risco
    const moderation = await this.runReasoningBrain(content, userContext);

    if (!moderation.safe) {
      return moderation;
    }

    // 3. CÉREBRO 2 (Llama 3.2 Local): Mentoria Empática & Suporte Emocional
    const mentorSuggestion = await this.runMentorBrain(content, userContext);

    // 4. APRENDIZADO CONTÍNUO: Atualização da Memória Vetorial no pgvector em segundo plano
    if (userId && this.memoryRepository) {
      this.learnFromInteractionInBackground(userId, content, userContext).catch(() => {});
    }

    return {
      safe: true,
      mentorSuggestion,
    };
  }

  /**
   * CÉREBRO 1: DeepSeek-R1 (Moderação, Raciocínio & Risco)
   */
  private async runReasoningBrain(
    content: string,
    userContext?: string
  ): Promise<{ safe: boolean; isCrisis?: boolean; reason?: string }> {
    const systemPrompt =
      "Você é o Cérebro Analítico de Segurança do Sentinela Aletis. " +
      "Desabafos profundos sobre dor, ansiedade, frustração, estresse e cansaço são 100% PERMITIDOS e DEVEM ser APROVADOS. " +
      "APENAS rejeite se contiver discurso de ódio explícito, ameaças graves de violência ou spam malicioso. " +
      (userContext ? `\nMEMÓRIA CONTÍNUA DO AUTOR: "${userContext}"` : "") +
      "\nSe aprovado, responda EXATAMENTE: 'APROVADO'. " +
      "\nSe rejeitado, responda 'REJEITADO: <motivo em português>'.";

    try {
      const res = await fetch(`${this.ollamaBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3500),
        body: JSON.stringify({
          model: this.reasoningModel,
          temperature: 0.1,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "";
        const clean = this.cleanAiResponse(raw);

        if (clean.toUpperCase().startsWith("APROVADO")) {
          return { safe: true };
        } else if (clean.toUpperCase().includes("REJEITADO")) {
          const parts = clean.split(/REJEITADO:?/i);
          const reason = parts[1]?.trim() || "Conteúdo sinalizado pelas diretrizes da comunidade.";
          return { safe: false, reason };
        }
      }
    } catch (err: any) {
      console.warn("Aviso no Cérebro DeepSeek Ollama local:", err?.message ?? err);
    }

    return { safe: true }; // Fail-open resiliente
  }

  /**
   * CÉREBRO 2: Llama 3.2 (Mentoria & Suporte Empático)
   */
  private async runMentorBrain(
    content: string,
    userContext?: string
  ): Promise<string | undefined> {
    if (!this.ollamaBaseUrl || !this.ollamaBaseUrl.trim() || content.trim().length >= 100) return undefined;


    const systemPrompt =
      "Você é o Cérebro de Mentoria Empática do Aletis. O usuário compartilhou um desabafo curto. " +
      "Ofereça UMA frase gentil, reflexiva e acolhedora em português que o incentive a expandir se desejar." +
      (userContext ? `\nHISTÓRICO EMOCIONAL DO AUTOR: "${userContext}"` : "");

    try {
      const res = await fetch(`${this.ollamaBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify({
          model: this.mentorModel,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "";
        return this.cleanAiResponse(raw);
      }
    } catch (err: any) {
      console.warn("Aviso no Cérebro Llama Ollama local:", err?.message ?? err);
    }

    return undefined;
  }

  /**
   * APRENDIZADO CONTÍNUO (Memória Vetorial no pgvector)
   */
  private async learnFromInteractionInBackground(
    userId: string,
    content: string,
    currentMemory?: string
  ): Promise<void> {
    if (!this.memoryRepository) return;

    try {
      const prompt =
        `Resuma em 2 frases curtas o estado emocional e os tópicos principais deste usuário para a memória contínua:\n` +
        `NOVO REGISTRO: "${content}"` +
        (currentMemory ? `\nMEMÓRIA ANTERIOR: "${currentMemory}"` : "");

      const res = await fetch(`${this.ollamaBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
        body: JSON.stringify({
          model: this.mentorModel,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSummary = this.cleanAiResponse(data.choices?.[0]?.message?.content ?? "");

        if (newSummary) {
          // Gerar embedding local do novo resumo
          const embedding = await this.generateEmbedding(newSummary);

          if (embedding.length > 0 && typeof (this.memoryRepository as any).saveUserMemoryWithEmbedding === "function") {
            await (this.memoryRepository as any).saveUserMemoryWithEmbedding(userId, newSummary, [], embedding);
          } else {
            await this.memoryRepository.saveUserMemory(userId, newSummary, []);
          }
        }
      }
    } catch {
      // Aprendizado em segundo plano falha silenciosamente sem impactar o usuário
    }
  }
}
