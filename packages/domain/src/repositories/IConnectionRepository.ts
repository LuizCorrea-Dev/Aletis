import { Friend, PrivateMessage, MessageType } from "../schemas/connection";

export interface IConnectionRepository {
  getFollowState(targetId: string): Promise<boolean>;
  getFollowers(targetUserId?: string): Promise<Friend[]>;
  getFollowing(targetUserId?: string): Promise<Friend[]>;
  getFriendshipStatus(targetId: string): Promise<"none" | "pending_sent" | "pending_received" | "accepted">;
  getFriends(targetUserId?: string): Promise<Friend[]>;
  getPendingRequests(targetUserId?: string): Promise<Friend[]>;
  requestFriendship(targetId: string): Promise<{ success: boolean; message: string }>;
  acceptFriendship(requesterId: string): Promise<boolean>;
  getConversations(): Promise<Friend[]>;
  getMessages(friendId: string): Promise<PrivateMessage[]>;
  sendMessage(
    friendId: string,
    content: string,
    type?: MessageType,
    mediaUrl?: string
  ): Promise<PrivateMessage>;
  markMessagesAsRead(friendId: string): Promise<void>;
  getGlobalNotificationCount(): Promise<number>;
  removeFriendship(targetId: string): Promise<boolean>;
  toggleCloseFriend(friendId: string): Promise<boolean>;
  getFavoriteFriends(targetUserId?: string): Promise<Friend[]>;
}

