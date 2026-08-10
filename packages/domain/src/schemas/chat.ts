import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string(),
  content: z.string(),
  createdAt: z.string(),
  type: z.enum(["text", "image", "audio", "video", "promotion_request"]),
  mediaUrl: z.string().optional(),
  channelId: z.string().optional(),
  receiverId: z.string().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
