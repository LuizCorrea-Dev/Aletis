import { z } from "zod";

export const AtrioItemSchema = z.object({
  id: z.string(),
  dbId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string(),
  title: z.string(),
  url: z.string(),
  color: z.string(),
  description: z.string().optional(),
  vibes: z.number(),
});
export type AtrioItem = z.infer<typeof AtrioItemSchema>;

export const AtrioListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  itemIds: z.array(z.string()),
  coverUrl: z.string().optional(),
  createdAt: z.string(),
});
export type AtrioList = z.infer<typeof AtrioListSchema>;
