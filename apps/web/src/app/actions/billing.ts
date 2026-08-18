"use server";

import { getCurrentUser } from "@/utils/auth";
import { CreateCheckoutSessionUseCase, CreateCheckoutSessionInput } from "@aletis/application";
import { headers } from "next/headers";

export async function createCheckoutSessionAction(input: CreateCheckoutSessionInput) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { success: false, message: "Sessão não encontrada. Por favor, faça login." };
    }

    const headerList = await headers();
    const host = headerList.get("host") || "localhost:3000";
    const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const useCase = new CreateCheckoutSessionUseCase();
    const result = await useCase.execute(user.id, input, baseUrl);

    if (!result.url) {
      return { success: false, message: "Não foi possível gerar a sessão de pagamento com o Stripe." };
    }

    return { success: true, url: result.url, sessionId: result.sessionId };
  } catch (error: any) {
    console.error("Erro na Server Action createCheckoutSessionAction:", error);
    return {
      success: false,
      message: error?.message || "Ocorreu um erro ao processar seu pedido de checkout.",
    };
  }
}
