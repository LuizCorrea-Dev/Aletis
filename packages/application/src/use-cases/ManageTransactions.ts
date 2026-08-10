import { ITransactionRepository, TransactionResult } from "@aletis/domain";

export class ManageTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) { }

  async getBalance(userId: string): Promise<number> {
    return this.transactionRepository.getBalance(userId);
  }

  async processReward(type: 'post' | 'atrio' | 'notice'): Promise<TransactionResult> {
    return this.transactionRepository.processReward(type);
  }

  async transferVibe(recipientId: string, amount: number = 1, postId?: string, commentId?: string): Promise<TransactionResult> {
    return this.transactionRepository.transferVibe(recipientId, amount, postId, commentId);
  }

  async processFollow(targetId: string): Promise<TransactionResult> {
    return this.transactionRepository.processFollow(targetId);
  }

  async processUnfollow(targetId: string): Promise<TransactionResult> {
    return this.transactionRepository.processUnfollow(targetId);
  }
}
