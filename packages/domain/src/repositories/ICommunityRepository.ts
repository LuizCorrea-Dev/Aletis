import {
  Community,
  Channel,
  CommunityMessage,
  CommunityMember,
  CreateCommunityInput,
  UpdateCommunityInput,
  CreateChannelInput,
  RoleType,
} from "../schemas/community";

export interface ICommunityRepository {
  // --- Queries ---
  getCommunities(query?: string): Promise<Community[]>;
  getCommunityById(id: string): Promise<Community | undefined>;
  getCommunityByInviteCode(code: string): Promise<Community | undefined>;
  getUserCommunities(userId: string): Promise<Community[]>;

  // --- Channels ---
  getChannels(communityId: string): Promise<Channel[]>;
  createChannel(input: CreateChannelInput): Promise<Channel>;
  updateChannel(channelId: string, updates: { name?: string; topic?: string; isPrivate?: boolean; type?: string }): Promise<boolean>;
  deleteChannel(channelId: string): Promise<boolean>;
  markChannelAsRead(channelId: string): Promise<void>;

  // --- Messages ---
  getMessages(channelId: string): Promise<CommunityMessage[]>;
  sendMessage(
    channelId: string,
    content: string,
    mediaUrl?: string,
    authorId?: string
  ): Promise<CommunityMessage>;
  updateMessage(channelId: string, messageId: string, newContent: string, authorId?: string): Promise<boolean>;
  deleteMessage(channelId: string, messageId: string, userId?: string): Promise<boolean>;
  togglePinMessage(channelId: string, messageId: string): Promise<boolean>;
  toggleHighlightMessage(channelId: string, messageId: string): Promise<boolean>;


  // --- Members ---
  getMembers(communityId: string): Promise<CommunityMember[]>;
  updateMemberPermissions(
    communityId: string,
    userId: string,
    permissions: {
      allowText?: boolean;
      allowLinks?: boolean;
      allowVideos?: boolean;
      allowPhotos?: boolean;
    }
  ): Promise<boolean>;

  // --- Mutations ---
  createCommunity(input: CreateCommunityInput): Promise<Community>;
  updateCommunity(id: string, updates: UpdateCommunityInput): Promise<void>;
  deleteCommunity(communityId: string): Promise<boolean>;
  joinCommunity(
    communityId: string,
    userId?: string
  ): Promise<{ success: boolean; role: RoleType }>;
  leaveCommunity(communityId: string, userId?: string): Promise<boolean>;
  generateInviteLink(communityId: string): Promise<string>;
  updateChannelAccess(
    channelId: string,
    accessLevel: "PUBLIC" | "PRIVATE" | "STAFF_ONLY"
  ): Promise<boolean>;

  // --- Moderation ---
  approveAccess(communityId: string, userId: string): Promise<boolean>;
  rejectAccess(communityId: string, userId: string): Promise<boolean>;
  undoRejectAccess(communityId: string, userId: string): Promise<boolean>;
  kickMember(communityId: string, userId: string): Promise<boolean>;
  updateMemberRole(
    communityId: string,
    userId: string,
    newRole: RoleType
  ): Promise<{ success: boolean; message: string }>;
  acceptModeration(communityId: string, userId: string): Promise<boolean>;

  // --- Roles & Permissions ---
  getRoles(communityId: string): Promise<any[]>;
  createRole(communityId: string, roleData: { name: string; color: string; icon: string; permissions: any }): Promise<any>;
  updateRole(roleId: string, updates: { name?: string; color?: string; icon?: string; permissions?: any }): Promise<boolean>;
  deleteRole(roleId: string): Promise<boolean>;
  assignMemberRole(communityId: string, userId: string, roleId: string): Promise<boolean>;

  // --- Nicknames ---
  setMemberNickname(communityId: string, userId: string, nickname: string): Promise<boolean>;

  // --- Bans & Mutes ---
  banMember(communityId: string, userId: string, reason?: string): Promise<boolean>;
  unbanMember(communityId: string, userId: string): Promise<boolean>;
  getBannedMembers(communityId: string): Promise<any[]>;

  muteMember(communityId: string, userId: string, durationMinutes: number, reason?: string): Promise<boolean>;
  unmuteMember(communityId: string, userId: string): Promise<boolean>;

  // --- Polls ---
  createPoll(communityId: string, question: string, options: string[], channelId?: string, durationHours?: number): Promise<any>;
  votePoll(pollId: string, optionIndex: number): Promise<boolean>;
  getPolls(communityId: string, channelId?: string): Promise<any[]>;
}

