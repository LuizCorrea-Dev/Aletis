import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModeratePostUseCase } from "../ModeratePost";
import { IPostRepository, CreatePostData } from "@aletis/domain";

// ── Mock de fetch para o Ollama local (DualBrainSentinelaService) ─────────────
const setupFetchMock = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string, init?: any) => {
      const body = init?.body ? JSON.parse(init.body) : {};

      if (url.includes("/api/embeddings")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ embedding: new Array(768).fill(0.1) }),
        });
      }

      if (url.includes("/v1/chat/completions")) {
        const messages = body.messages || [];
        const systemPrompt = messages[0]?.content || "";
        const userContent = messages[1]?.content || messages[0]?.content || "";

        if (systemPrompt.includes("Sentinela")) {
          if (userContent.includes("discurso de ódio") || userContent.includes("spam")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ choices: [{ message: { content: "REJEITADO: Conteúdo contém discurso de ódio." } }] }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "APROVADO" } }] }),
          });
        }

        if (systemPrompt.includes("Mentoria")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "Quer contar um pouco mais sobre o que está sentindo?" } }] }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: "APROVADO" } }] }),
        });
      }

      return Promise.reject(new Error("Unmocked fetch url"));
    })
  );
};


// ── Helpers ───────────────────────────────────────────────────────────────────
const makePost = (overrides: Partial<CreatePostData> = {}): CreatePostData => ({
  content: "Hoje estou me sentindo sobrecarregado, mas sigo tentando.",
  tags: ["apoio"],
  type: "post",
  isAuthorAnonymous: false,
  authorVisibilityLevel: "PUBLIC",
  allowedGroupIds: [],
  allowedUserIds: [],
  ...overrides,
});

const makeRepo = (): IPostRepository =>
  ({
    getPosts: vi.fn(),
    getUserPosts: vi.fn(),
    createPost: vi.fn().mockResolvedValue({ success: true, message: "Post publicado!" }),
    deletePost: vi.fn().mockResolvedValue({ success: true }),
    updatePost: vi.fn().mockResolvedValue(true),
    togglePin: vi.fn().mockResolvedValue(true),
    getTrendingTags: vi.fn(),
    uploadMedia: vi.fn(),
    getPostComments: vi.fn(),
    addComment: vi.fn(),
    deleteComment: vi.fn(),
    subscribeToFeedUpdates: vi.fn(),
  }) as unknown as IPostRepository;

// ── Testes ────────────────────────────────────────────────────────────────────
describe("ModeratePostUseCase — Sistema Sentinela", () => {
  let repo: IPostRepository;

  beforeEach(() => {
    repo = makeRepo();
    setupFetchMock();
    vi.clearAllMocks();
  });


  // ── Camada 1: Heurística Local ─────────────────────────────────────────────
  describe("Camada 1 — Filtro Heurístico Local (custo $0)", () => {
    it("deve barrar spam de caracteres repetidos sem chamar a IA", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(makePost({ content: "aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa" }));

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(result.message).toContain("Sentinela");
      expect(repo.createPost).not.toHaveBeenCalled();
    });

    it("deve barrar textos com diversidade mínima de caracteres (spam)", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      // "ababababababababababababababab" — 2 chars únicos, ratio ~0.07
      const result = await useCase.execute(makePost({ content: "ababababababababababababababab" }));

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(repo.createPost).not.toHaveBeenCalled();
    });

    it("deve barrar repetição contínua da mesma palavra", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(
        makePost({ content: "teste teste teste teste teste teste" })
      );

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(repo.createPost).not.toHaveBeenCalled();
    });
  });

  // ── Camada 2: Groq — Moderação ─────────────────────────────────────────────
  describe("Camada 2a — Moderação de Segurança (Groq)", () => {
    it("deve aprovar texto legítimo e salvar o post", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(makePost());

      expect(result.success).toBe(true);
      expect(result.safe).toBe(true);
      expect(repo.createPost).toHaveBeenCalledOnce();
    });

    it("deve barrar conteúdo com discurso de ódio identificado pela IA", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(
        makePost({ content: "Este post tem discurso de ódio explícito." })
      );

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(result.message).toContain("Conteúdo contém discurso de ódio");
      expect(repo.createPost).not.toHaveBeenCalled();
    });

    it("deve ativar o Protocolo SOS de Emergência com isCrisis=true para ideação suicida", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(
        makePost({ content: "Eu quero me matar!" })
      );

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(result.isCrisis).toBe(true);
      expect(result.crisisData).toBeDefined();
      expect(result.crisisData?.helplines).toHaveLength(3);
      expect(result.crisisData?.helplines[0].phone).toBe("188");
      expect(repo.createPost).not.toHaveBeenCalled();
    });
  });

  // ── Camada 2b: Mentoria de Aletis ─────────────────────────────────────────
  describe("Camada 2b — Mentoria de Aletis", () => {
    it("deve retornar mentorSuggestion para posts curtos (< 80 chars)", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const result = await useCase.execute(makePost({ content: "Tô mal." }));

      expect(result.success).toBe(true);
      expect(result.mentorSuggestion).toBeDefined();
      expect(typeof result.mentorSuggestion).toBe("string");
    });

    it("não deve retornar mentorSuggestion para posts longos (>= 80 chars)", async () => {
      const useCase = new ModeratePostUseCase(repo, "mock-key");
      const longContent =
        "Hoje me sinto muito sobrecarregado com o trabalho e a vida pessoal, mas estou tentando manter a calma.";
      const result = await useCase.execute(makePost({ content: longContent }));

      expect(result.success).toBe(true);
      expect(result.mentorSuggestion).toBeUndefined();
    });
  });

  // ── Resiliência — Sem API Key ───────────────────────────────────────────────
  describe("Resiliência — operação sem chave Groq", () => {
    it("deve aprovar e publicar o post mesmo sem API key (fallback Camada 1)", async () => {
      const useCase = new ModeratePostUseCase(repo, ""); // sem chave
      const result = await useCase.execute(makePost());

      expect(result.success).toBe(true);
      expect(result.safe).toBe(true);
      expect(result.mentorSuggestion).toBeUndefined();
      expect(repo.createPost).toHaveBeenCalledOnce();
    });

    it("deve ainda barrar spam mesmo sem API key (Camada 1 continua ativa)", async () => {
      const useCase = new ModeratePostUseCase(repo, ""); // sem chave
      const result = await useCase.execute(makePost({ content: "aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa" }));

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(repo.createPost).not.toHaveBeenCalled();
    });

    it("deve usar chave com espaços como ausente (trim)", async () => {
      const useCase = new ModeratePostUseCase(repo, "   "); // espaços apenas
      const result = await useCase.execute(makePost());

      expect(result.success).toBe(true);
      expect(result.safe).toBe(true);
    });
  });
});
