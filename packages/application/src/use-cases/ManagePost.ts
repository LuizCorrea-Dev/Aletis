import { IPostRepository } from "@aletis/domain";

export class ManagePostUseCase {
  constructor(private readonly postRepository: IPostRepository) { }

  async deletePost(postId: string) {
    // Aqui no futuro podemos verificar se o usuário é o dono do post, ou se é admin
    return this.postRepository.deletePost(postId);
  }

  async updatePost(postId: string, content: string, tags: string[], mediaUrl?: string) {
    return this.postRepository.updatePost(postId, content, tags, mediaUrl);
  }

  async togglePin(postId: string, isPinned: boolean) {
    return this.postRepository.togglePin(postId, isPinned);
  }

  async uploadMedia(file: File) {
    return this.postRepository.uploadMedia(file);
  }
}
