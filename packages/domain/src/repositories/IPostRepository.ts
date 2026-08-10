import { Post, CreatePostData, Comment, CreateCommentData } from "../schemas/post";

export interface IPostRepository {
  getPosts(filterTag?: string, communityId?: string, page?: number): Promise<Post[]>;
  getUserPosts(userId: string, type?: "post" | "diary"): Promise<Post[]>;
  createPost(data: CreatePostData): Promise<{ success: boolean; message: string }>;
  deletePost(postId: string): Promise<{ success: boolean }>;
  updatePost(postId: string, content: string, tags: string[], mediaUrl?: string): Promise<boolean>;
  togglePin(postId: string, isPinned: boolean): Promise<boolean>;
  getTrendingTags(): Promise<string[]>;
  uploadMedia(file: File): Promise<string | null>;
  getPostComments(postId: string): Promise<Comment[]>;
  addComment(data: CreateCommentData, userId: string): Promise<{ success: boolean; message: string }>;
  deleteComment(commentId: string): Promise<{ success: boolean }>;
  subscribeToFeedUpdates(callback: (payload: any) => void): { unsubscribe: () => void };
}
