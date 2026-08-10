import { IChatRepository, ChatMessage } from "@aletis/domain";

export class ManageChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) { }

  subscribeToChannel(
    channelId: string,
    callback: (message: ChatMessage) => void
  ) {
    return this.chatRepository.subscribeToChannel(channelId, callback);
  }

  subscribeToDMs(
    currentUserId: string,
    callback: (message: ChatMessage) => void
  ) {
    return this.chatRepository.subscribeToDMs(currentUserId, callback);
  }
}
