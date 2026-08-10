import { z } from "zod";

// --- Enums ---
export const ChannelTypeSchema = z.enum(["FEED", "CHAT", "VOICE"]);
export type ChannelType = z.infer<typeof ChannelTypeSchema>;

export const PrivacyTypeSchema = z.enum(["PUBLIC", "PRIVATE"]);
export type PrivacyType = z.infer<typeof PrivacyTypeSchema>;

export const AccessLevelSchema = z.enum(["PUBLIC", "PRIVATE", "STAFF_ONLY"]);
export type AccessLevel = z.infer<typeof AccessLevelSchema>;

export const RoleTypeSchema = z.enum([
  "OWNER",
  "MODERATOR",
  "MEMBER",
  "PENDING",
  "REJECTED",
]);
export type RoleType = z.infer<typeof RoleTypeSchema>;

// --- Entities ---
export const ChannelSchema = z.object({
  id: z.string().uuid(),
  communityId: z.string().uuid(),
  name: z.string(),
  type: ChannelTypeSchema,
  isPrivate: z.boolean(),
  isAnnouncements: z.boolean().optional(),
  accessLevel: AccessLevelSchema.optional().default("PUBLIC"),
  topic: z.string().optional(),
  hasUnread: z.boolean().optional(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const CommunityMemberSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  avatar: z.string(),
  role: RoleTypeSchema,
  allowText: z.boolean().optional().default(true),
  allowLinks: z.boolean().optional().default(true),
  allowVideos: z.boolean().optional().default(true),
  allowPhotos: z.boolean().optional().default(true),
});
export type CommunityMember = z.infer<typeof CommunityMemberSchema>;

export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  bannerUrl: z.string(),
  avatarUrl: z.string(),
  privacy: PrivacyTypeSchema,
  memberCount: z.number(),
  tags: z.array(z.string()),
  isMember: z.boolean().optional(),
  currentUserRole: RoleTypeSchema.nullable(),
  isMuted: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  welcomeMessage: z.string().optional(),
  inviteCode: z.string().optional(),
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunityMessageSchema = z.object({
  id: z.string().uuid(),
  channelId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userAvatar: z.string(),
  content: z.string(),
  mediaUrl: z.string().optional(),
  timestamp: z.string(),
  vibes: z.number(),
  type: z.enum(["text", "image", "audio", "video"]),
  isPinned: z.boolean().optional(),
  isHighlighted: z.boolean().optional(),
});
export type CommunityMessage = z.infer<typeof CommunityMessageSchema>;

// --- Custom Roles & Permissions ---
export const CommunityRolePermissionsSchema = z.object({
  canViewPrivateChannels: z.boolean().default(false),
  canChangeNicknames: z.boolean().default(false),
  canKickMembers: z.boolean().default(false),
  canManageJoinRequests: z.boolean().default(false),
  canBanMembers: z.boolean().default(false),
  canMuteMembers: z.boolean().default(false),
  canCreatePolls: z.boolean().default(false),
});
export type CommunityRolePermissions = z.infer<typeof CommunityRolePermissionsSchema>;

export const CommunityRoleSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  name: z.string(),
  color: z.string().default('#a855f7'),
  icon: z.string().default('Shield'),
  isSystem: z.boolean().default(false),
  permissions: CommunityRolePermissionsSchema,
});
export type CommunityRole = z.infer<typeof CommunityRoleSchema>;

export const CommunityBanSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  userId: z.string(),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  bannedBy: z.string(),
  reason: z.string().optional(),
  createdAt: z.string(),
});
export type CommunityBan = z.infer<typeof CommunityBanSchema>;

export const CommunityMuteSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  userId: z.string(),
  mutedUntil: z.string(),
  reason: z.string().optional(),
});
export type CommunityMute = z.infer<typeof CommunityMuteSchema>;

export const CommunityPollSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  channelId: z.string().optional(),
  creatorId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  votesCount: z.record(z.number()),
  userVotedOption: z.number().nullable(),
  totalVotes: z.number(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});
export type CommunityPoll = z.infer<typeof CommunityPollSchema>;

// --- Input Schemas ---
export const CreateCommunityInputSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(500),
  privacy: PrivacyTypeSchema,
  tags: z.array(z.string()),
});
export type CreateCommunityInput = z.infer<typeof CreateCommunityInputSchema>;

export const UpdateCommunityInputSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  bannerUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
  welcomeMessage: z.string().optional(),
  isSuspended: z.boolean().optional(),
  inviteCode: z.string().optional(),
});
export type UpdateCommunityInput = z.infer<typeof UpdateCommunityInputSchema>;

export const CreateChannelInputSchema = z.object({
  communityId: z.string().uuid(),
  name: z.string().min(1, "Nome do canal é obrigatório").max(50, "Nome muito longo"),
  type: ChannelTypeSchema,
  isPrivate: z.boolean().optional().default(false),
  isAnnouncements: z.boolean().optional().default(false),
  accessLevel: AccessLevelSchema.optional().default("PUBLIC"),
  topic: z.string().optional(),
});
export type CreateChannelInput = z.infer<typeof CreateChannelInputSchema>;


