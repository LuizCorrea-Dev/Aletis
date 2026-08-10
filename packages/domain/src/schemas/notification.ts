import { z } from "zod";

export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "COMMUNITY_INVITE" | "SYSTEM";

export interface NotificationItem {
  id: string;
  userId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl: string;
  isRead: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl?: string;
}

export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  actorId: z.string().uuid().optional(),
  type: z.enum(["LIKE", "COMMENT", "FOLLOW", "COMMUNITY_INVITE", "SYSTEM"]),
  title: z.string().min(1),
  content: z.string().min(1),
  linkUrl: z.string().optional(),
});
