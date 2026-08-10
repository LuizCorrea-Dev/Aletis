import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  username: z.string()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Nome de usuário só pode conter letras, números e underline"),
  bio: z.string().max(160, "A bio não pode passar de 160 caracteres").default(""),
  status: z.string().max(50, "Status não pode passar de 50 caracteres").default("Em busca de equilíbrio."),
  avatarUrl: z.string().url("URL do avatar inválido"),
  bannerUrl: z.string().url("URL da capa inválido"),
  vibes: z.number().nonnegative().default(0),
  vibeSaldoReal: z.number().nonnegative().default(100),
  vibeOrvalho: z.number().nonnegative().default(0),
  ultimaDataOrvalho: z.string().nullable().optional(),
  autoridadeScore: z.number().nonnegative().default(0),
  tier: z.enum(["comum", "ancora", "verificado"]).default("comum"),
  tipoPerfil: z.enum(["comum", "ancora", "verificado"]).default("comum"),
  dataNascimento: z.string().optional(),
  localizacaoAtual: z.string().optional(),
  perfilCompleto: z.boolean().default(false),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  isAnonymousDefault: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  lastUsernameChange: z.string().datetime().nullable().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  username: z.string()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
    .max(30)
    .transform((val) => val.trim().replace(/\s+/g, "_"))
    .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), "Nome de usuário só pode conter letras, números e underline"),
  bio: z.string().max(160, "A bio não pode passar de 160 caracteres").default(""),
  status: z.string().max(50, "Status não pode passar de 50 caracteres").default("Em busca de equilíbrio."),
  avatarUrl: z.string().url("URL do avatar inválido"),
  bannerUrl: z.string().url("URL da capa inválido"),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  isAnonymousDefault: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
});

export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;

