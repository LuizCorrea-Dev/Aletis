import { Pool } from "pg";
import { IChatRepository, ChatMessage } from "@aletis/domain";
import { getDbPool } from "../db";

export class PostgresChatRepository implements IChatRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getDbPool();
  }

  subscribeToChannel(
    channelId: string,
    callback: (message: ChatMessage) => void
  ) {
    return {
      unsubscribe: () => {},
    };
  }

  subscribeToDMs(
    currentUserId: string,
    callback: (message: ChatMessage) => void
  ) {
    return {
      unsubscribe: () => {},
    };
  }
}
