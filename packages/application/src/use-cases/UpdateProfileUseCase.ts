import { IUserRepository, UpdateUserProfileData, UpdateUserProfileSchema, UserProfile } from "@aletis/domain";

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) { }

  async execute(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<{ success: boolean; message: string; data?: UserProfile }> {

    // 1. Zod Validation
    const parsed = UpdateUserProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    try {
      // 2. Fetch current profile to compare username and last change date
      const currentProfile = await this.userRepository.getUserProfile(userId);
      if (!currentProfile) {
        return { success: false, message: "Perfil não encontrado." };
      }

      const isUsernameChanging = parsed.data.username.toLowerCase().trim() !== currentProfile.username.toLowerCase().trim();

      if (isUsernameChanging) {
        // 3. Check 30-day username change window
        const lastChange = await this.userRepository.getUsernameLastChange(userId);
        if (lastChange) {
          const diffTime = Math.abs(new Date().getTime() - lastChange.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 30) {
            const daysRemaining = 30 - diffDays;
            return {
              success: false,
              message: `Você só pode alterar seu nome de usuário a cada 30 dias. Disponível em ${daysRemaining}d.`
            };
          }
        }

        // 4. Check username availability
        const isAvailable = await this.userRepository.isUsernameAvailable(
          parsed.data.username.toLowerCase().trim(),
          userId
        );
        if (!isAvailable) {
          return { success: false, message: "Este nome de usuário já está em uso." };
        }
      }

      // 5. Apply update
      return await this.userRepository.updateUserProfile(userId, {
        name: parsed.data.name.trim(),
        username: parsed.data.username.toLowerCase().trim(),
        bio: parsed.data.bio.trim(),
        status: parsed.data.status.trim(),
        avatarUrl: parsed.data.avatarUrl,
        bannerUrl: parsed.data.bannerUrl,
        phone: parsed.data.phone,
        countryCode: parsed.data.countryCode,
        isAnonymousDefault: parsed.data.isAnonymousDefault,
        isSuspended: parsed.data.isSuspended,
      });

    } catch (error: any) {
      console.error("[UpdateProfileUseCase] Error:", error.message);
      return { success: false, message: error.message || "Erro inesperado ao atualizar perfil." };
    }
  }
}
