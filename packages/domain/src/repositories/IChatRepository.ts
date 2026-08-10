import { ChatMessage } from "../schemas/chat";

export interface IChatRepository {
  subscribeToChannel(
    channelId: string,
    callback: (message: ChatMessage) => void
  ): { unsubscribe: () => void };

  subscribeToDMs(
    currentUserId: string,
    callback: (message: ChatMessage) => void
  ): { unsubscribe: () => void };
}
