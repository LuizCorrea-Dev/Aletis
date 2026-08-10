"use server";

import { getCurrentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { UpdateUserProfileSchema, UpdateUserProfileData } from "@aletis/domain";
import { UpdateProfileUseCase } from "@aletis/application";
import { PostgresUserRepository } from "@aletis/infrastructure";

export async function updateProfileAction(data: UpdateUserProfileData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    const parsed = UpdateUserProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const repository = new PostgresUserRepository();
    const useCase = new UpdateProfileUseCase(repository);

    const result = await useCase.execute(user.id, parsed.data);

    if (result.success) {
      revalidatePath("/profile");
      revalidatePath(`/u/${parsed.data.username}`);
      revalidatePath("/feed");
    }

    return result;

  } catch (error: any) {
    console.error("[ProfileAction] Error updating profile:", error.message);
    return { success: false, message: error.message || "Erro interno no servidor.", data: undefined };
  }
}
