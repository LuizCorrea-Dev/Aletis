import {
  ICommunityRepository,
  Community,
  Channel,
  CommunityMessage,
  CommunityMember,
  CreateCommunityInput,
  UpdateCommunityInput,
  CreateChannelInput,
  RoleType,
} from "@aletis/domain";

export class ManageCommunity {
  constructor(private readonly repo: ICommunityRepository) { }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  listAll(query?: string): Promise<Community[]> {
    return this.repo.getCommunities(query);
  }

  findById(id: string): Promise<Community | undefined> {
    return this.repo.getCommunityById(id);
  }

  findByInviteCode(code: string): Promise<Community | undefined> {
    return this.repo.getCommunityByInviteCode(code);
  }

  listUserCommunities(userId: string): Promise<Community[]> {
    return this.repo.getUserCommunities(userId);
  }

  // ─── Channels ─────────────────────────────────────────────────────────────────

  getChannels(communityId: string): Promise<Channel[]> {
    return this.repo.getChannels(communityId);
  }

  createChannel(input: CreateChannelInput): Promise<Channel> {
    return this.repo.createChannel(input);
  }

  deleteChannel(channelId: string): Promise<boolean> {
    return this.repo.deleteChannel(channelId);
  }

  markChannelAsRead(channelId: string): Promise<void> {
    return this.repo.markChannelAsRead(channelId);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────────

  getMessages(channelId: string): Promise<CommunityMessage[]> {
    return this.repo.getMessages(channelId);
  }

  sendMessage(channelId: string, content: string, mediaUrl?: string): Promise<CommunityMessage> {
    return this.repo.sendMessage(channelId, content, mediaUrl);
  }

  deleteMessage(channelId: string, messageId: string): Promise<boolean> {
    return this.repo.deleteMessage(channelId, messageId);
  }

  togglePinMessage(channelId: string, messageId: string): Promise<boolean> {
    return this.repo.togglePinMessage(channelId, messageId);
  }

  toggleHighlightMessage(channelId: string, messageId: string): Promise<boolean> {
    return this.repo.toggleHighlightMessage(channelId, messageId);
  }

  // ─── Members ──────────────────────────────────────────────────────────────────

  getMembers(communityId: string): Promise<CommunityMember[]> {
    return this.repo.getMembers(communityId);
  }

  updateMemberPermissions(
    communityId: string,
    userId: string,
    permissions: {
      allowText?: boolean;
      allowLinks?: boolean;
      allowVideos?: boolean;
      allowPhotos?: boolean;
    }
  ): Promise<boolean> {
    return this.repo.updateMemberPermissions(communityId, userId, permissions);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  create(input: CreateCommunityInput): Promise<Community> {
    return this.repo.createCommunity(input);
  }

  update(id: string, updates: UpdateCommunityInput): Promise<void> {
    return this.repo.updateCommunity(id, updates);
  }

  delete(communityId: string): Promise<boolean> {
    return this.repo.deleteCommunity(communityId);
  }

  join(communityId: string): Promise<{ success: boolean; role: RoleType }> {
    return this.repo.joinCommunity(communityId);
  }

  leave(communityId: string): Promise<boolean> {
    return this.repo.leaveCommunity(communityId);
  }

  generateInviteLink(communityId: string): Promise<string> {
    return this.repo.generateInviteLink(communityId);
  }

  updateChannelAccess(
    channelId: string,
    accessLevel: "PUBLIC" | "PRIVATE" | "STAFF_ONLY"
  ): Promise<boolean> {
    return this.repo.updateChannelAccess(channelId, accessLevel);
  }

  // ─── Moderation ───────────────────────────────────────────────────────────────

  approveAccess(communityId: string, userId: string): Promise<boolean> {
    return this.repo.approveAccess(communityId, userId);
  }

  rejectAccess(communityId: string, userId: string): Promise<boolean> {
    return this.repo.rejectAccess(communityId, userId);
  }

  undoRejectAccess(communityId: string, userId: string): Promise<boolean> {
    return this.repo.undoRejectAccess(communityId, userId);
  }

  kickMember(communityId: string, userId: string): Promise<boolean> {
    return this.repo.kickMember(communityId, userId);
  }

  updateMemberRole(
    communityId: string,
    userId: string,
    newRole: RoleType
  ): Promise<{ success: boolean; message: string }> {
    return this.repo.updateMemberRole(communityId, userId, newRole);
  }

  acceptModeration(communityId: string, userId: string): Promise<boolean> {
    return this.repo.acceptModeration(communityId, userId);
  }

  // ─── Roles & Permissions ───────────────────────────────────────────────────

  getRoles(communityId: string): Promise<any[]> {
    return this.repo.getRoles(communityId);
  }

  createRole(communityId: string, roleData: { name: string; color: string; icon: string; permissions: any }): Promise<any> {
    return this.repo.createRole(communityId, roleData);
  }

  updateRole(roleId: string, updates: { name?: string; color?: string; icon?: string; permissions?: any }): Promise<boolean> {
    return this.repo.updateRole(roleId, updates);
  }

  deleteRole(roleId: string): Promise<boolean> {
    return this.repo.deleteRole(roleId);
  }

  assignMemberRole(communityId: string, userId: string, roleId: string): Promise<boolean> {
    return this.repo.assignMemberRole(communityId, userId, roleId);
  }

  // ─── Nicknames ─────────────────────────────────────────────────────────────

  setMemberNickname(communityId: string, userId: string, nickname: string): Promise<boolean> {
    return this.repo.setMemberNickname(communityId, userId, nickname);
  }

  // ─── Bans & Mutes ──────────────────────────────────────────────────────────

  banMember(communityId: string, userId: string, reason?: string): Promise<boolean> {
    return this.repo.banMember(communityId, userId, reason);
  }

  unbanMember(communityId: string, userId: string): Promise<boolean> {
    return this.repo.unbanMember(communityId, userId);
  }

  getBannedMembers(communityId: string): Promise<any[]> {
    return this.repo.getBannedMembers(communityId);
  }

  muteMember(communityId: string, userId: string, durationMinutes: number, reason?: string): Promise<boolean> {
    return this.repo.muteMember(communityId, userId, durationMinutes, reason);
  }

  unmuteMember(communityId: string, userId: string): Promise<boolean> {
    return this.repo.unmuteMember(communityId, userId);
  }

  // ─── Polls ─────────────────────────────────────────────────────────────────

  createPoll(communityId: string, question: string, options: string[], channelId?: string, durationHours?: number): Promise<any> {
    return this.repo.createPoll(communityId, question, options, channelId, durationHours);
  }

  votePoll(pollId: string, optionIndex: number): Promise<boolean> {
    return this.repo.votePoll(pollId, optionIndex);
  }

  getPolls(communityId: string, channelId?: string): Promise<any[]> {
    return this.repo.getPolls(communityId, channelId);
  }
}
