import { z } from "zod";

export const TransactionResultSchema = z.object({
  success: z.boolean(),
  newBalance: z.number(),
  message: z.string(),
  dewCollected: z.boolean().optional(),
});

export type TransactionResult = z.infer<typeof TransactionResultSchema>;
