import { z } from "zod";

export const MessageTypeSchema = z.enum(["text", "image", "video", "audio", "promotion_request"]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const FriendSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  status: z.enum(["online", "offline", "busy"]),
  friendshipStatus: z.enum(["none", "pending_sent", "pending_received", "accepted"]).optional(),
  lastMessage: z.string().optional(),
  lastMessageTime: z.string().optional(),
  unreadCount: z.number(),
  isCloseFriend: z.boolean().optional(),
  isFollowing: z.boolean().optional(),
});
export type Friend = z.infer<typeof FriendSchema>;

export const PrivateMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: MessageTypeSchema,
  mediaUrl: z.string().optional(),
  timestamp: z.string(),
  isRead: z.boolean(),
  receiverId: z.string().optional(),
});
export type PrivateMessage = z.infer<typeof PrivateMessageSchema>;
