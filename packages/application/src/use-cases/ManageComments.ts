import { IPostRepository, CreateCommentData } from "@aletis/domain";

export class ManageCommentsUseCase {
  constructor(private readonly postRepository: IPostRepository) { }

  async getComments(postId: string) {
    return this.postRepository.getPostComments(postId);
  }

  async addComment(data: CreateCommentData, userId: string) {
    return this.postRepository.addComment(data, userId);
  }

  async deleteComment(commentId: string) {
    return this.postRepository.deleteComment(commentId);
  }
}
