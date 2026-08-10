import { NotificationItem, CreateNotificationInput } from "../schemas/notification";

export interface INotificationRepository {
  getUserNotifications(userId: string): Promise<NotificationItem[]>;
  getUnreadCount(userId: string): Promise<number>;
  createNotification(input: CreateNotificationInput): Promise<NotificationItem | null>;
  markAsRead(userId: string, notificationId?: string): Promise<boolean>;
  deleteNotification(notificationId: string, userId: string): Promise<boolean>;
}
