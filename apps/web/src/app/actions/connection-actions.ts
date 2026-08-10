"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/auth";
import { Friend, PrivateMessage, MessageType } from "@aletis/domain";
import { PostgresConnectionRepository, PostgresNotificationRepository } from "@aletis/infrastructure";

async function getRepository() {
  return new PostgresConnectionRepository();
}

export async function getFollowStateAction(targetId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getFollowState(targetId, user?.id);
  } catch (error) {
    console.error("Error in getFollowStateAction:", error);
    return false;
  }
}

export async function getFollowersAction(targetUserId?: string): Promise<Friend[]> {
  try {
    const repo = await getRepository();
    return await repo.getFollowers(targetUserId);
  } catch (error) {
    console.error("Error in getFollowersAction:", error);
    return [];
  }
}

export async function getFollowingAction(targetUserId?: string): Promise<Friend[]> {
  try {
    const repo = await getRepository();
    return await repo.getFollowing(targetUserId);
  } catch (error) {
    console.error("Error in getFollowingAction:", error);
    return [];
  }
}

export async function getFriendshipStatusAction(
  targetId: string
): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getFriendshipStatus(targetId, user?.id);
  } catch (error) {
    console.error("Error in getFriendshipStatusAction:", error);
    return "none";
  }
}

export async function getFriendsAction(targetUserId?: string): Promise<Friend[]> {
  try {
    const repo = await getRepository();
    return await repo.getFriends(targetUserId);
  } catch (error) {
    console.error("Error in getFriendsAction:", error);
    return [];
  }
}

export async function getPendingRequestsAction(targetUserId?: string): Promise<Friend[]> {
  try {
    const repo = await getRepository();
    return await repo.getPendingRequests(targetUserId);
  } catch (error) {
    console.error("Error in getPendingRequestsAction:", error);
    return [];
  }
}

export async function requestFriendshipAction(targetId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const result = await repo.requestFriendship(targetId, user.id);
    revalidatePath("/connections");
    return result;
  } catch (error: any) {
    console.error("Error in requestFriendshipAction:", error);
    return { success: false, message: error.message || "Erro ao solicitar amizade." };
  }
}

export async function acceptFriendshipAction(requesterId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const repo = await getRepository();
    const success = await repo.acceptFriendship(requesterId, user.id);
    revalidatePath("/connections");
    return { success };
  } catch (error) {
    console.error("Error in acceptFriendshipAction:", error);
    return { success: false };
  }
}

export async function getConversationsAction(): Promise<Friend[]> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getConversations(user?.id);
  } catch (error) {
    console.error("Error in getConversationsAction:", error);
    return [];
  }
}

export async function getMessagesAction(friendId: string): Promise<PrivateMessage[]> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getMessages(friendId, user?.id);
  } catch (error) {
    console.error("Error in getMessagesAction:", error);
    return [];
  }
}

export async function sendMessageAction(
  friendId: string,
  content: string,
  type?: MessageType,
  mediaUrl?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const message = await repo.sendMessage(friendId, content, type, mediaUrl, user.id);
    return { success: true, data: message };
  } catch (error: any) {
    console.error("Error in sendMessageAction:", error);
    return { success: false, message: error.message || "Erro ao enviar mensagem." };
  }
}

export async function markMessagesAsReadAction(friendId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const repo = await getRepository();
    await repo.markMessagesAsRead(friendId, user.id);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getGlobalNotificationCountAction(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const notifRepo = new PostgresNotificationRepository();
    return await notifRepo.getUnreadCount(user.id);
  } catch (error) {
    return 0;
  }
}

export async function toggleCloseFriendAction(friendId: string) {
  return { success: true };
}

export async function toggleFollowAction(targetId: string): Promise<{ success: boolean; isFollowing: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, isFollowing: false };

    const repo = await getRepository();
    const currentFollow = await repo.getFollowState(targetId, user.id);
    if (currentFollow) {
      await repo.removeFriendship(targetId, user.id);
      revalidatePath("/connections");
      return { success: true, isFollowing: false };
    } else {
      await repo.requestFriendship(targetId, user.id);
      revalidatePath("/connections");
      return { success: true, isFollowing: true };
    }
  } catch (error) {
    console.error("Error in toggleFollowAction:", error);
    return { success: false, isFollowing: false };
  }
}

export async function removeFriendshipAction(targetId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const repo = await getRepository();
    const success = await repo.removeFriendship(targetId, user.id);
    revalidatePath("/connections");
    return { success };
  } catch (error) {
    console.error("Error in removeFriendshipAction:", error);
    return { success: false };
  }
}

export async function getFavoriteFriendsAction(targetUserId?: string): Promise<Friend[]> {
  return [];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  avatarUrl?: string;
  createdAt: string;
  rawCreatedAt?: string;
  linkUrl: string;
}

export async function markNotificationsAsReadAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const notifRepo = new PostgresNotificationRepository();
    await notifRepo.markAsRead(user.id);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getDetailedNotificationsAction(): Promise<NotificationItem[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const notifRepo = new PostgresNotificationRepository();
    const items = await notifRepo.getUserNotifications(user.id);
    return items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.content,
      avatarUrl: n.avatarUrl,
      createdAt: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      rawCreatedAt: n.createdAt,
      linkUrl: n.linkUrl,
    }));
  } catch (error) {
    console.error("Error in getDetailedNotificationsAction:", error);
    return [];
  }
}

