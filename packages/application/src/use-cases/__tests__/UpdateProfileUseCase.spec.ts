import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateProfileUseCase } from "../UpdateProfileUseCase";
import { IUserRepository, UserProfile, UpdateUserProfileData } from "@aletis/domain";

describe("UpdateProfileUseCase", () => {
  let userRepositoryMock: IUserRepository;
  let useCase: UpdateProfileUseCase;

  const mockUserProfile: UserProfile = {
    id: "b0ca37eb-38d6-42e1-8e71-e2e121894763",
    name: "Luiz Correa",
    username: "luizcorrea",
    bio: "Minha bio original",
    status: "Em busca de equilíbrio.",
    avatarUrl: "https://example.com/avatar.png",
    bannerUrl: "https://example.com/banner.png",
    vibes: 10,
    lastUsernameChange: null,
  };

  beforeEach(() => {
    userRepositoryMock = {
      getUserProfile: vi.fn().mockResolvedValue(mockUserProfile),
      updateUserProfile: vi.fn().mockImplementation((userId, data) =>
        Promise.resolve({
          success: true,
          message: "Perfil atualizado!",
          data: { ...mockUserProfile, ...data }
        })
      ),
      isUsernameAvailable: vi.fn().mockResolvedValue(true),
      getUsernameLastChange: vi.fn().mockResolvedValue(null),
    };

    useCase = new UpdateProfileUseCase(userRepositoryMock);
  });

  it("should successfully update profile when all inputs are valid and username doesn't change", async () => {
    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa Editado",
      username: "luizcorrea", // same username
      bio: "Nova bio editada",
      status: "Em harmonia.",
      avatarUrl: "https://example.com/new-avatar.png",
      bannerUrl: "https://example.com/new-banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Perfil atualizado!");
    expect(result.data?.name).toBe("Luiz Correa Editado");
    expect(result.data?.bio).toBe("Nova bio editada");
    expect(result.data?.status).toBe("Em harmonia.");
    expect(result.data?.avatarUrl).toBe("https://example.com/new-avatar.png");
    expect(result.data?.bannerUrl).toBe("https://example.com/new-banner.png");
    expect(userRepositoryMock.updateUserProfile).toHaveBeenCalledWith(mockUserProfile.id, updateData);
  });

  it("should fail validation if display name (name) is too short", async () => {
    const updateData: UpdateUserProfileData = {
      name: "L", // too short
      username: "luizcorrea",
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "https://example.com/avatar.png",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Nome deve ter pelo menos 2 caracteres");
  });

  it("should fail validation if username has invalid characters", async () => {
    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa",
      username: "luiz@correa", // invalid '@' character
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "https://example.com/avatar.png",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Nome de usuário só pode conter letras, números e underline");
  });

  it("should fail validation if avatar or banner urls are invalid", async () => {
    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa",
      username: "luizcorrea",
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "invalid-url",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("URL do avatar inválido");
  });

  it("should block username change if last change was less than 30 days ago", async () => {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    vi.spyOn(userRepositoryMock, "getUsernameLastChange").mockResolvedValue(twentyDaysAgo);

    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa",
      username: "luizcorreanovo", // changed username
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "https://example.com/avatar.png",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Você só pode alterar seu nome de usuário a cada 30 dias");
  });

  it("should fail if the new username is already taken by another user", async () => {
    vi.spyOn(userRepositoryMock, "isUsernameAvailable").mockResolvedValue(false);

    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa",
      username: "luizcorreanovo", // changed username
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "https://example.com/avatar.png",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Este nome de usuário já está em uso.");
    expect(userRepositoryMock.isUsernameAvailable).toHaveBeenCalledWith("luizcorreanovo", mockUserProfile.id);
  });

  it("should allow username change if more than 30 days passed and username is available", async () => {
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    vi.spyOn(userRepositoryMock, "getUsernameLastChange").mockResolvedValue(fortyDaysAgo);
    vi.spyOn(userRepositoryMock, "isUsernameAvailable").mockResolvedValue(true);

    const updateData: UpdateUserProfileData = {
      name: "Luiz Correa",
      username: "luizcorreanovo", // changed username
      bio: "Minha bio",
      status: "Em busca de equilíbrio.",
      avatarUrl: "https://example.com/avatar.png",
      bannerUrl: "https://example.com/banner.png",
    };

    const result = await useCase.execute(mockUserProfile.id, updateData);

    expect(result.success).toBe(true);
    expect(result.data?.username).toBe("luizcorreanovo");
  });
});
