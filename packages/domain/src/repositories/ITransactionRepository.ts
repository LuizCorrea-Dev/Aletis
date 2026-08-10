import { TransactionResult } from "../schemas/transaction";

export interface PostRewardResult extends TransactionResult {
  breakdown: {
    total: number;
    orvalho: number;
    post: number;
    media: number;
  };
}

export interface ITransactionRepository {
  getBalance(userId: string): Promise<number>;
  processReward(type: "post" | "atrio" | "notice", userId?: string): Promise<TransactionResult>;
  processPostRewards(userId: string, hasMedia?: boolean, postId?: string): Promise<PostRewardResult>;
  transferVibe(recipientId: string, amount?: number, postId?: string, commentId?: string, senderId?: string): Promise<TransactionResult>;
  processFollow(targetId: string, currentUserId?: string): Promise<TransactionResult>;
  processUnfollow(targetId: string, currentUserId?: string): Promise<TransactionResult>;
  logTransaction(userId: string, amount: number, type: string, relatedId?: string, description?: string): Promise<boolean>;
}

