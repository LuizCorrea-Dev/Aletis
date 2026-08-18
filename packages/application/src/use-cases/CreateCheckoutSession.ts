import { z } from "zod";
import Stripe from "stripe";

// Schemas de Validação Zod
export const ProfessionalSubscriptionInputSchema = z.object({
  purchaseType: z.literal("assinatura_profissional"),
  months: z.number().refine((val) => [1, 3, 6, 9, 12, 24].includes(val), {
    message: "Duração deve ser 1, 3, 6, 9, 12 ou 24 meses.",
  }),
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  registrationNumber: z.string().min(3, "Número de registro profissional (CRP/OPP) é obrigatório"),
  specialties: z.string().min(2, "Especialidades são obrigatórias"),
  documentUrl: z.string().optional(),
  currency: z.enum(["brl", "eur"]).default("brl"),
});

export const VibeBoostInputSchema = z.object({
  purchaseType: z.literal("vibe_boost"),
  packageId: z.enum(["semente", "orvalho_estendido", "farol_comunidade"]),
  currency: z.enum(["brl", "eur"]).default("brl"),
});

export const CreateCheckoutSessionInputSchema = z.discriminatedUnion("purchaseType", [
  ProfessionalSubscriptionInputSchema,
  VibeBoostInputSchema,
]);

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

// Tabela de Preços e Configurações dos Pacotes
export const VIBE_BOOST_PACKAGES = {
  semente: {
    name: "Pacote Semente (20 VIBEs)",
    vibeAmount: 20,
    priceBrl: 990, // em centavos (R$ 9,90)
    priceEur: 199, // em centavos (1,99 €)
  },
  orvalho_estendido: {
    name: "Pacote Orvalho Estendido (100 VIBEs)",
    vibeAmount: 100,
    priceBrl: 2490, // em centavos (R$ 24,90)
    priceEur: 499, // em centavos (4,99 €)
  },
  farol_comunidade: {
    name: "Pacote Farol da Comunidade (300 VIBEs)",
    vibeAmount: 300,
    priceBrl: 5990, // em centavos (R$ 59,90)
    priceEur: 1199, // em centavos (11,99 €)
  },
} as const;

export const PROFESSIONAL_PLAN_PRICES: Record<number, { priceBrl: number; priceEur: number; discountLabel: string }> = {
  1: { priceBrl: 4990, priceEur: 999, discountLabel: "Plano Mensal" },
  3: { priceBrl: 13473, priceEur: 2697, discountLabel: "10% de Desconto" },
  6: { priceBrl: 25449, priceEur: 5095, discountLabel: "15% de Desconto (Destaque)" },
  9: { priceBrl: 35928, priceEur: 7193, discountLabel: "20% de Desconto" },
  12: { priceBrl: 41916, priceEur: 8392, discountLabel: "30% de Desconto" },
  24: { priceBrl: 71856, priceEur: 14386, discountLabel: "40% de Desconto" },
};

export class CreateCheckoutSessionUseCase {
  private stripe: Stripe;
  private apiKey: string;

  constructor(secretKey?: string) {
    this.apiKey = secretKey || process.env.STRIPE_SECRET_KEY || "";
    this.stripe = new Stripe(this.apiKey || "sk_test_invalid_placeholder", {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }

  async execute(userId: string, input: CreateCheckoutSessionInput, baseUrl: string) {
    if (!this.apiKey || this.apiKey.includes("mock_key") || this.apiKey.includes("sua_chave")) {
      throw new Error(
        "Chave Secreta da API Stripe (STRIPE_SECRET_KEY) não foi configurada. Por favor, adicione sua chave real ou de testes da Stripe (ex: sk_test_...) no seu arquivo .env."
      );
    }

    const validatedData = CreateCheckoutSessionInputSchema.parse(input);
    const currency = validatedData.currency.toLowerCase();
    const stripeAccount = process.env.STRIPE_ACCOUNT_ID || undefined;

    try {
      if (validatedData.purchaseType === "assinatura_profissional") {
        const planInfo = PROFESSIONAL_PLAN_PRICES[validatedData.months];
        if (!planInfo) {
          throw new Error("Plano selecionado inválido.");
        }

        const unitAmount = currency === "eur" ? planInfo.priceEur : planInfo.priceBrl;

        const session = await this.stripe.checkout.sessions.create(
          {
            payment_method_types: ["card"],
            mode: "subscription",
            client_reference_id: userId,
            customer_email: undefined,
            metadata: {
              userId,
              purchaseType: "assinatura_profissional",
              months: String(validatedData.months),
              fullName: validatedData.fullName,
              registrationNumber: validatedData.registrationNumber,
              specialties: validatedData.specialties,
              documentUrl: validatedData.documentUrl || "",
            },
            line_items: [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: `Perfil Profissional Verificado - ${validatedData.months} Mês(es)`,
                    description: `Acesso à visibilidade clínica credenciada no Aletis (${planInfo.discountLabel}).`,
                  },
                  unit_amount: unitAmount,
                  recurring: {
                    interval: "month",
                    interval_count: validatedData.months,
                  },
                },
                quantity: 1,
              },
            ],
            success_url: `${baseUrl}/billing?status=success&type=assinatura_profissional&months=${validatedData.months}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/billing?status=canceled`,
          },
          {
            idempotencyKey: `sub_${userId}_${validatedData.months}_${Date.now()}`,
          }
        );

        return { sessionId: session.id, url: session.url };
      } else {
        // Compra de Pacote VIBE Boost
        const packageInfo = VIBE_BOOST_PACKAGES[validatedData.packageId];
        if (!packageInfo) {
          throw new Error("Pacote VIBE Boost inválido.");
        }

        const unitAmount = currency === "eur" ? packageInfo.priceEur : packageInfo.priceBrl;

        const session = await this.stripe.checkout.sessions.create(
          {
            payment_method_types: ["card"],
            mode: "payment",
            client_reference_id: userId,
            metadata: {
              userId,
              purchaseType: "vibe_boost",
              packageId: validatedData.packageId,
              vibeAmount: String(packageInfo.vibeAmount),
            },
            line_items: [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: packageInfo.name,
                    description: `Crédito permanente de ${packageInfo.vibeAmount} VIBEs para apoiar desabafos e postagens na rede Aletis.`,
                  },
                  unit_amount: unitAmount,
                },
                quantity: 1,
              },
            ],
            success_url: `${baseUrl}/billing?status=success&type=vibe_boost&vibeAmount=${packageInfo.vibeAmount}&packageId=${validatedData.packageId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/billing?status=canceled`,
          },
          {
            idempotencyKey: `vibe_${userId}_${validatedData.packageId}_${Date.now()}`,
          }
        );

        return { sessionId: session.id, url: session.url };
      }
    } catch (error: any) {
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case "StripeCardError":
            throw new Error(`Cartão recusado: ${error.message}`);
          case "StripeInvalidRequestError":
            throw new Error(`Parâmetros inválidos na solicitação do Stripe: ${error.message}`);
          case "StripeAuthenticationError":
            throw new Error("Falha de autenticação na API do Stripe. Verifique a chave STRIPE_SECRET_KEY.");
          case "StripeAPIError":
            throw new Error("Erro interno nos servidores da Stripe. Tente novamente em instantes.");
          case "StripeConnectionError":
            throw new Error("Falha na conexão de rede com os servidores da Stripe.");
          default:
            throw new Error(`Erro na API Stripe (${error.code || error.type}): ${error.message}`);
        }
      }
      throw error;
    }
  }
}
