import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModeratePostUseCase } from "../ModeratePost";
import { ManagePostUseCase } from "../ManagePost";
import { IPostRepository, CreatePostData, Post } from "@aletis/domain";

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

      return Promise.reject(new Error("Unmocked fetch url"));
    })
  );
};


describe("FeedPrincipal & Post Management Use Cases", () => {
  let postRepositoryMock: IPostRepository;
  let moderateUseCase: ModeratePostUseCase;
  let manageUseCase: ManagePostUseCase;

  const mockPost: Post = {
    id: "post-123",
    authorId: "user-123",
    authorName: "Luiz",
    authorAvatar: "",
    content: "Texto original do desabafo",
    mediaUrl: "https://example.com/original-image.png",
    tags: ["desabafo"],
    initialVibes: 0,
    totalVibesReceived: 0,
    totalComments: 0,
    type: "post",
    communityId: null,
    createdAt: new Date().toISOString(),
    userHasLiked: false,
    isPinned: false,
    isAuthorAnonymous: true,
    authorVisibilityLevel: "PUBLIC",
    allowedGroupIds: [],
    allowedUserIds: [],
  };

  beforeEach(() => {
    setupFetchMock();
    postRepositoryMock = {

      getPosts: vi.fn(),
      getUserPosts: vi.fn(),
      createPost: vi.fn().mockImplementation((data: CreatePostData) =>
        Promise.resolve({
          success: true,
          message: "Post publicado!",
          data: { ...mockPost, ...data }
        })
      ),
      deletePost: vi.fn().mockResolvedValue({ success: true }),
      updatePost: vi.fn().mockResolvedValue(true),
      togglePin: vi.fn().mockResolvedValue(true),
      getTrendingTags: vi.fn(),
      uploadMedia: vi.fn(),
      getPostComments: vi.fn(),
      addComment: vi.fn(),
      deleteComment: vi.fn(),
      subscribeToFeedUpdates: vi.fn(),
    };

    moderateUseCase = new ModeratePostUseCase(postRepositoryMock, "mock-api-key");
    manageUseCase = new ManagePostUseCase(postRepositoryMock);
  });

  describe("Criação de Posts (ModeratePostUseCase)", () => {
    it("deve criar um post com sucesso se o texto for aprovado pela moderação", async () => {
      const postData: CreatePostData = {
        content: "Hoje me sinto um pouco sobrecarregado, mas sigo em frente.",
        tags: ["apoio", "crescimento"],
        mediaUrl: "https://example.com/sharing-image.jpg",
        communityId: undefined,
        type: "post",
        isAuthorAnonymous: true,
        authorVisibilityLevel: "PUBLIC",
        allowedGroupIds: [],
        allowedUserIds: [],
      };

      const result = await moderateUseCase.execute(postData);

      expect(result.success).toBe(true);
      expect(result.safe).toBe(true);
      expect(result.message).toBe("Post publicado!");
      expect(postRepositoryMock.createPost).toHaveBeenCalledWith(postData);
    });

    it("deve respeitar as configurações de 'Quem pode ver' ao criar um post", async () => {
      const postData: CreatePostData = {
        content: "Desabafo restrito para amigos próximos.",
        tags: ["segredo"],
        mediaUrl: "https://example.com/restricted.jpg",
        type: "post",
        isAuthorAnonymous: false,
        authorVisibilityLevel: "FRIENDS_ONLY", // Quem pode ver
        allowedGroupIds: [],
        allowedUserIds: ["amigo-1", "amigo-2"],
      };

      const result = await moderateUseCase.execute(postData);

      expect(result.success).toBe(true);
      expect(result.safe).toBe(true);
      expect(postRepositoryMock.createPost).toHaveBeenCalledWith(postData);
    });

    it("deve barrar a criação do post na Camada 1 se houver spam de caracteres repetidos sem consumir a IA", async () => {
      const postData: CreatePostData = {
        content: "aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa aaaaaaa",
        tags: ["spam"],
        type: "post",
        isAuthorAnonymous: true,
        authorVisibilityLevel: "PUBLIC",
        allowedGroupIds: [],
        allowedUserIds: [],
      };

      const result = await moderateUseCase.execute(postData);

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(result.message).toContain("Sentinela");
      expect(postRepositoryMock.createPost).not.toHaveBeenCalled();
    });

    it("deve barrar a criação do post se a moderação identificar conteúdo impróprio (ódio ou spam)", async () => {
      const postData: CreatePostData = {
        content: "Este post contem discurso de ódio e palavras criminosas.",
        tags: ["violência"],
        type: "post",
        isAuthorAnonymous: true,
        authorVisibilityLevel: "PUBLIC",
        allowedGroupIds: [],
        allowedUserIds: [],
      };

      const result = await moderateUseCase.execute(postData);

      expect(result.success).toBe(false);
      expect(result.safe).toBe(false);
      expect(result.message).toBeDefined();
      expect(postRepositoryMock.createPost).not.toHaveBeenCalled();
    });
  });

  describe("Edição, Exclusão e Pin de Posts (ManagePostUseCase)", () => {
    it("deve editar um post com sucesso atualizando texto, tags e imagem", async () => {
      const updatedContent = "Texto do desabafo editado e atualizado";
      const updatedTags = ["superacao", "cura"];
      const updatedMediaUrl = "https://example.com/new-image.jpg";

      const result = await manageUseCase.updatePost(
        "post-123",
        updatedContent,
        updatedTags,
        updatedMediaUrl
      );

      expect(result).toBe(true);
      expect(postRepositoryMock.updatePost).toHaveBeenCalledWith(
        "post-123",
        updatedContent,
        updatedTags,
        updatedMediaUrl
      );
    });

    it("deve excluir um post com sucesso com base no id do post", async () => {
      const result = await manageUseCase.deletePost("post-123");

      expect(result.success).toBe(true);
      expect(postRepositoryMock.deletePost).toHaveBeenCalledWith("post-123");
    });

    it("deve alternar a fixação (pin/unpin) de um post com sucesso", async () => {
      const result = await manageUseCase.togglePin("post-123", true);

      expect(result).toBe(true);
      expect(postRepositoryMock.togglePin).toHaveBeenCalledWith("post-123", true);
    });
  });
});
