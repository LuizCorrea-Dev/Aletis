import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModeratePostUseCase } from "../ModeratePost";
import { IPostRepository, ISentinelaMemoryRepository, CreatePostData } from "@aletis/domain";

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
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: "APROVADO" } }] }),
        });
      }

      return Promise.reject(new Error("Unmocked fetch url"));
    })
  );
};

describe("Sentinela — Arquitetura de Memória Contínua", () => {
  let postRepo: IPostRepository;
  let memoryRepo: ISentinelaMemoryRepository;
  let useCase: ModeratePostUseCase;

  const mockPost: CreatePostData = {
    content: "Hoje a mesa continua um caos, mas consegui tirar uma xícara de lá.",
    tags: ["desabafo"],
    type: "post",
    isAuthorAnonymous: false,
    authorVisibilityLevel: "PUBLIC",
    allowedGroupIds: [],
    allowedUserIds: [],
  };

  beforeEach(() => {
    setupFetchMock();
    postRepo = {
      createPost: vi.fn().mockResolvedValue({ success: true, message: "Post publicado!" }),
    } as unknown as IPostRepository;

    memoryRepo = {
      getUserMemory: vi.fn().mockResolvedValue({
        id: "mem-1",
        userId: "user-123",
        summary: "Autor relatou forte paralisia e sobrecarga de trabalho com mesa bagunçada no dia anterior.",
        keyFacts: ["sobrecarga", "estresse"],
        updatedAt: new Date().toISOString(),
      }),
      saveUserMemory: vi.fn().mockResolvedValue(true),
      saveUserMemoryWithEmbedding: vi.fn().mockResolvedValue(true),
      registerInfraction: vi.fn().mockResolvedValue(true),
      isUserInTimeout: vi.fn().mockResolvedValue(false),
    };

    useCase = new ModeratePostUseCase(postRepo, "http://localhost:11434", undefined, undefined, undefined, memoryRepo);
    vi.clearAllMocks();
  });


  it("deve recuperar a memória contínua do usuário e injetar no contexto da IA", async () => {
    const result = await useCase.execute(mockPost, "user-123");

    expect(result.success).toBe(true);
    expect(result.safe).toBe(true);
    expect(memoryRepo.getUserMemory).toHaveBeenCalledWith("user-123");
    expect(postRepo.createPost).toHaveBeenCalled();
  });

  it("deve disparar a extração seletiva de memória em segundo plano ao salvar o post", async () => {
    await useCase.execute(mockPost, "user-123");

    // Aguarda micro-task de background memory update
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(
      (memoryRepo as any).saveUserMemoryWithEmbedding || memoryRepo.saveUserMemory
    ).toHaveBeenCalled();
  });
});

