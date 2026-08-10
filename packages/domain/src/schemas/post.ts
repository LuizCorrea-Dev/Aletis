import { z } from "zod";

export const PrivacyLevelSchema = z.enum([
  "PUBLIC",
  "FRIENDS_ONLY",
  "FRIENDS_OF_FRIENDS",
  "SELECTED_FRIENDS",
  "SPECIFIC_GROUPS",
]);

export type PrivacyLevel = z.infer<typeof PrivacyLevelSchema>;

export const PostSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid().nullable().optional(), // Can be null if anonymous
  authorName: z.string(),
  authorAvatar: z.string().url().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório").max(5000),
  mediaUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  initialVibes: z.number().default(0),
  totalVibesReceived: z.number().default(0),
  totalComments: z.number().default(0),
  type: z.enum(["post", "atrio", "diary", "community"]).default("post"),
  communityId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime(),
  userHasLiked: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isAuthorAnonymous: z.boolean().default(false),
  authorVisibilityLevel: PrivacyLevelSchema.default("PUBLIC"),
  allowedGroupIds: z.array(z.string().uuid()).default([]),
  allowedUserIds: z.array(z.string().uuid()).default([]),
});

export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = z.object({
  content: z.string().min(1, "O post não pode estar vazio").max(5000),
  mediaUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  communityId: z.string().uuid().optional(),
  type: z.enum(["post", "atrio", "diary", "community"]).default("post"),
  isAuthorAnonymous: z.boolean().default(false),
  authorVisibilityLevel: PrivacyLevelSchema.default("PUBLIC"),
  allowedGroupIds: z.array(z.string().uuid()).default([]),
  allowedUserIds: z.array(z.string().uuid()).default([]),
});

export type CreatePostData = z.infer<typeof CreatePostSchema>;

export const CommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  authorName: z.string(),
  authorAvatar: z.string().url().optional(),
  content: z.string().min(1).max(1000),
  vibes: z.number().default(0),
  createdAt: z.string().datetime(),
  userHasLiked: z.boolean().default(false),
  parentId: z.string().uuid().optional().nullable(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1, "O comentário não pode estar vazio").max(1000),
  parentId: z.string().uuid().optional().nullable(),
});

export type CreateCommentData = z.infer<typeof CreateCommentSchema>;
