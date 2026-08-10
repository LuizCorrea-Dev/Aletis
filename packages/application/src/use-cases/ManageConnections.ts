import { IConnectionRepository, Friend, PrivateMessage, MessageType } from "@aletis/domain";

export class ManageConnectionsUseCase {
  constructor(private readonly connectionRepository: IConnectionRepository) { }

  getFollowState(targetId: string): Promise<boolean> {
    return this.connectionRepository.getFollowState(targetId);
  }

  getFollowers(targetUserId?: string): Promise<Friend[]> {
    return this.connectionRepository.getFollowers(targetUserId);
  }

  getFollowing(targetUserId?: string): Promise<Friend[]> {
    return this.connectionRepository.getFollowing(targetUserId);
  }

  getFriendshipStatus(targetId: string): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
    return this.connectionRepository.getFriendshipStatus(targetId);
  }

  getFriends(targetUserId?: string): Promise<Friend[]> {
    return this.connectionRepository.getFriends(targetUserId);
  }

  getPendingRequests(targetUserId?: string): Promise<Friend[]> {
    return this.connectionRepository.getPendingRequests(targetUserId);
  }

  requestFriendship(targetId: string): Promise<{ success: boolean; message: string }> {
    return this.connectionRepository.requestFriendship(targetId);
  }

  acceptFriendship(requesterId: string): Promise<boolean> {
    return this.connectionRepository.acceptFriendship(requesterId);
  }

  getConversations(): Promise<Friend[]> {
    return this.connectionRepository.getConversations();
  }

  getMessages(friendId: string): Promise<PrivateMessage[]> {
    return this.connectionRepository.getMessages(friendId);
  }

  sendMessage(
    friendId: string,
    content: string,
    type?: MessageType,
    mediaUrl?: string
  ): Promise<PrivateMessage> {
    return this.connectionRepository.sendMessage(friendId, content, type, mediaUrl);
  }

  markMessagesAsRead(friendId: string): Promise<void> {
    return this.connectionRepository.markMessagesAsRead(friendId);
  }

  getGlobalNotificationCount(): Promise<number> {
    return this.connectionRepository.getGlobalNotificationCount();
  }

  removeFriendship(targetId: string): Promise<boolean> {
    return this.connectionRepository.removeFriendship(targetId);
  }

  toggleCloseFriend(friendId: string): Promise<boolean> {
    return this.connectionRepository.toggleCloseFriend(friendId);
  }

  getFavoriteFriends(targetUserId?: string): Promise<Friend[]> {
    return this.connectionRepository.getFavoriteFriends(targetUserId);
  }
}
