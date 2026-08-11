import { CreatePostData, IPostRepository, evaluateTextHeuristics, ISentinelaMemoryRepository } from "@aletis/domain";
import { DualBrainSentinelaService } from "../services/DualBrainSentinelaService";

export interface CrisisHelpline {
  name: string;
  phone: string;
  available: string;
  website?: string;
}

export interface ModeratePostResult {
  success: boolean;
  message: string;
  safe?: boolean;
  isCrisis?: boolean;
  crisisData?: {
    region: string;
    message: string;
    helplines: CrisisHelpline[];
  };
  /** Sugestão do Mentor de Aletis — aparece quando o post é curto e aprovado */
  mentorSuggestion?: string;
}

export class ModeratePostUseCase {
  private dualBrainService: DualBrainSentinelaService;

  constructor(
    private readonly postRepository: IPostRepository,
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

  async execute(postData: CreatePostData, userId?: string): Promise<ModeratePostResult> {
    try {
      // ── Protocolo SOS de Emergência: Ideação Suicida / Risco de Vida ─────────
      const crisisRegex = /(matar|suicid|tirar\s+minha\s+vida|vou\s+me\s+matar|lesao\s+fisica|lesão\s+física|autolesao|autolesão|nao\s+quero\s+mais\s+viver|acabar\s+com\s+minha\s+vida|fim\s+da\s+minha\s+vida)/i;
      if (crisisRegex.test(postData.content)) {
        return {
          success: false,
          safe: false,
          isCrisis: true,
          crisisData: {
            region: "Brasil / Portugal / Internacional",
            message: "Você não está sozinho. A sua vida importa e nós queremos te apoiar agora. Se você está passando por um momento de dor insuportável, por favor converse com uma linha gratuita e confidencial de apoio imediato.",
            helplines: [
              { name: "CVV - Centro de Valorização da Vida (Brasil)", phone: "188", available: "24h Gratuito e Sigiloso", website: "https://cvv.org.br" },
              { name: "SNS 24 - Apoio Psicológico (Portugal)", phone: "808 24 24 24", available: "24h Serviço Nacional de Saúde", website: "https://sns24.gov.pt" },
              { name: "SAMU Emergência Médica", phone: "192", available: "24h Atendimento Médico Emergencial" },
            ],
          },
          message: "Protocolo de Emergência Ativado: Linhas de apoio à vida disponíveis imediatamente.",
        };
      }

      // ── Camada 1: Filtro Heurístico Local ($0 — sem consumo de API) ──────────
      const heuristicCheck = evaluateTextHeuristics(postData.content);
      if (!heuristicCheck.safe) {
        return {
          success: false,
          safe: false,
          message: heuristicCheck.reason ?? "O Sentinela barrou seu desabafo por violar as diretrizes.",
        };
      }

      // ── Camada 2: Sentinela IA Dual-Brain (DeepSeek Raciocínio + Llama Mentoria Local) ──
      const dualBrainResult = await this.dualBrainService.processInteraction(postData.content, userId);

      if (!dualBrainResult.safe) {
        return {
          success: false,
          safe: false,
          message: dualBrainResult.reason || "O Sentinela identificou conteúdo violador das diretrizes.",
        };
      }

      // Salvar post aprovado no repositório de banco PostgreSQL local
      const result = await this.postRepository.createPost(postData, userId);

      return {
        ...result,
        safe: true,
        mentorSuggestion: dualBrainResult.mentorSuggestion,
      };

    } catch (error: any) {
      console.error("Erro no ModeratePostUseCase:", error);
      return { success: false, message: "Erro interno ao processar o post." };
    }
  }
}
