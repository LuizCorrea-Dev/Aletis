import { evaluateTextHeuristics, ISentinelaMemoryRepository } from "@aletis/domain";
import { DualBrainSentinelaService } from "../services/DualBrainSentinelaService";

export interface ModerateCommentData {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

export interface ModerateCommentResult {
  success: boolean;
  message: string;
  safe: boolean;
  penaltyApplied?: boolean;
  vibesDeducted?: number;
  inTimeout?: boolean;
  mentorSuggestion?: string;
}

export class ModerateCommentUseCase {
  private dualBrainService: DualBrainSentinelaService;

  constructor(
    ollamaBaseUrl?: string,
    reasoningModel?: string,
    mentorModel?: string,
    embedModel?: string,
    private readonly memoryRepository?: ISentinelaMemoryRepository
  ) {
    this.dualBrainService = new DualBrainSentinelaService(
      memoryRepository,
      ollamaBaseUrl,
      reasoningModel,
      mentorModel,
      embedModel
    );
  }

  async execute(commentData: ModerateCommentData): Promise<ModerateCommentResult> {
    try {
      // 0. Verifica se o autor já está em Time-Out
      if (this.memoryRepository) {
        const isTimeout = await this.memoryRepository.isUserInTimeout(commentData.authorId);
        if (isTimeout) {
          return {
            success: false,
            safe: false,
            inTimeout: true,
            message: "Sua conta está em Time-Out por saldo zerado ou infrações. Publique um desabafo no feed para recuperar apoio.",
          };
        }
      }

      // ── Camada 1: Heurística Local ($0 — Anti-Farming & Spam) ────────────────
      const heuristicCheck = evaluateTextHeuristics(commentData.content);
      if (!heuristicCheck.safe) {
        return {
          success: false,
          safe: false,
          message: `O Sentinela bloqueou seu comentário: ${heuristicCheck.reason}`,
        };
      }

      // ── Camada 2: Sentinela IA Dual-Brain (DeepSeek Raciocínio + Llama Mentoria Local) ──
      const dualBrainResult = await this.dualBrainService.processInteraction(
        commentData.content,
        commentData.authorId
      );

      if (!dualBrainResult.safe) {
        // Aplica penalidade (-50 VIBES + Time-Out)
        if (this.memoryRepository) {
          try {
            await this.memoryRepository.registerInfraction(
              commentData.authorId,
              dualBrainResult.reason || "Deboche ou invalidação da dor alheia",
              50
            );
          } catch (e) {
            console.error("Erro ao registrar infração na memória do Sentinela:", e);
          }
        }

        return {
          success: false,
          safe: false,
          penaltyApplied: true,
          vibesDeducted: 50,
          inTimeout: true,
          message: dualBrainResult.reason || "Seu comentário foi bloqueado por conter deboche ou desdém insensível. Você perdeu -50 VIBES.",
        };
      }

      return {
        success: true,
        safe: true,
        message: "Comentário empático aprovado pelo Sentinela.",
        mentorSuggestion: dualBrainResult.mentorSuggestion,
      };

    } catch (error: any) {
      console.error("Erro no ModerateCommentUseCase:", error);
      return { success: true, message: "Comentário aprovado com fallback.", safe: true };
    }
  }
}
