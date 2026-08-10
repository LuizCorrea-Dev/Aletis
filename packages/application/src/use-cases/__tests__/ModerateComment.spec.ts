import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModerateCommentUseCase, ModerateCommentData } from "../ModerateComment";
import { ISentinelaMemoryRepository } from "@aletis/domain";

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
        const userContent = messages[1]?.content || messages[0]?.content || "";

        if (userContent.includes("deixa de frescura") || userContent.includes("preguiça")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "REJEITADO: Comentário contém deboche e invalidação da dor." } }] }),
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

describe("ModerateCommentUseCase — O Rigor das Respostas", () => {
  let memoryRepo: ISentinelaMemoryRepository;
  let useCase: ModerateCommentUseCase;

  const mockComment: ModerateCommentData = {
    postId: "post-1",
    authorId: "user-troll",
    authorName: "Troll",
    content: "Sei exatamente como é essa sensação de paralisação. Força para organizar sua mesa aos poucos!",
  };

  beforeEach(() => {
    setupFetchMock();
    memoryRepo = {
      getUserMemory: vi.fn().mockResolvedValue(null),
      saveUserMemory: vi.fn().mockResolvedValue(true),
      registerInfraction: vi.fn().mockResolvedValue(true),
      isUserInTimeout: vi.fn().mockResolvedValue(false),
    };

    useCase = new ModerateCommentUseCase("http://localhost:11434", undefined, undefined, undefined, memoryRepo);
    vi.clearAllMocks();
  });

  it("deve aprovar comentário empático legítimo e retornar mensagem positiva", async () => {
    const result = await useCase.execute(mockComment);

    expect(result.success).toBe(true);
    expect(result.safe).toBe(true);
    expect(result.message).toContain("Comentário empático aprovado");
    expect(memoryRepo.registerInfraction).not.toHaveBeenCalled();
  });

  it("deve barrar comentário deboche/invalidação, deduzir -50 VIBES e aplicar Time-Out (Troll-Buster)", async () => {
    const result = await useCase.execute({
      ...mockComment,
      content: "Deixa de frescura, é só arrumar a mesa, que preguiça!",
    });

    expect(result.success).toBe(false);
    expect(result.safe).toBe(false);
    expect(result.penaltyApplied).toBe(true);
    expect(result.vibesDeducted).toBe(50);
    expect(result.inTimeout).toBe(true);
    expect(memoryRepo.registerInfraction).toHaveBeenCalledWith(
      "user-troll",
      expect.stringContaining("deboche"),
      50
    );
  });

  it("deve barrar comentário com inflação artificial de caracteres na Camada 1 ($0)", async () => {
    const result = await useCase.execute({
      ...mockComment,
      content: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    expect(result.success).toBe(false);
    expect(result.safe).toBe(false);
    expect(result.message).toContain("repetição excessiva");
    expect(memoryRepo.registerInfraction).not.toHaveBeenCalled();
  });

  it("deve rejeitar publicação de usuário que já está em Time-Out ativo", async () => {
    vi.mocked(memoryRepo.isUserInTimeout).mockResolvedValue(true);

    const result = await useCase.execute(mockComment);

    expect(result.success).toBe(false);
    expect(result.inTimeout).toBe(true);
    expect(result.message).toContain("Time-Out");
  });
});

