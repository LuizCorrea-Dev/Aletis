"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/auth";
import {
  CreateCommunityInput,
  CreateCommunityInputSchema,
  UpdateCommunityInput,
  CreateChannelInput,
  CreateChannelInputSchema,
  RoleType,
  Community,
  Channel,
  CommunityMessage,
  CommunityMember
} from "@aletis/domain";
import { PostgresCommunityRepository } from "@aletis/infrastructure";

async function getRepository() {
  return new PostgresCommunityRepository();
}

export async function getCommunitiesAction(query?: string): Promise<Community[]> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getCommunities(query, user?.id);
  } catch (error) {
    console.error("Error in getCommunitiesAction:", error);
    return [];
  }
}

export async function getCommunityByIdAction(id: string): Promise<Community | undefined> {
  try {
    const user = await getCurrentUser();
    const repo = await getRepository();
    return await repo.getCommunityById(id, user?.id);
  } catch (error) {
    console.error("Error in getCommunityByIdAction:", error);
    return undefined;
  }
}

export async function getCommunityByInviteCodeAction(code: string): Promise<Community | undefined> {
  try {
    const repo = await getRepository();
    return await repo.getCommunityByInviteCode(code);
  } catch (error) {
    console.error("Error in getCommunityByInviteCodeAction:", error);
    return undefined;
  }
}

export async function getUserCommunitiesAction(userId: string): Promise<Community[]> {
  try {
    const user = await getCurrentUser();
    const target = userId === "current_user" ? user?.id : userId;
    if (!target) return [];
    const repo = await getRepository();
    return await repo.getUserCommunities(target);
  } catch (error) {
    console.error("Error in getUserCommunitiesAction:", error);
    return [];
  }
}

export async function createCommunityAction(input: CreateCommunityInput) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const parsed = CreateCommunityInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const repo = await getRepository();
    const community = await repo.createCommunity(parsed.data, user.id);

    revalidatePath("/communities");
    return { success: true, data: community };
  } catch (error: any) {
    console.error("Error in createCommunityAction:", error);
    return { success: false, message: error.message || "Erro ao criar comunidade." };
  }
}

export async function updateCommunityAction(id: string, updates: UpdateCommunityInput) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const community = await repo.getCommunityById(id, user.id);
    if (!community || (community.currentUserRole !== "OWNER" && community.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas administradores podem atualizar a comunidade." };
    }

    await repo.updateCommunity(id, updates);
    revalidatePath("/communities");
    revalidatePath(`/communities/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCommunityAction:", error);
    return { success: false, message: error.message || "Erro ao atualizar comunidade." };
  }
}

export async function deleteCommunityAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const community = await repo.getCommunityById(id, user.id);
    if (!community || community.currentUserRole !== "OWNER") {
      return { success: false, message: "Apenas o proprietário pode excluir a comunidade." };
    }

    const success = await repo.deleteCommunity(id);
    revalidatePath("/communities");
    return { success };
  } catch (error) {
    console.error("Error in deleteCommunityAction:", error);
    return { success: false, message: "Erro ao excluir comunidade." };
  }
}


export async function joinCommunityAction(communityId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const result = await repo.joinCommunity(communityId, user.id);

    revalidatePath("/communities");
    revalidatePath(`/communities/${communityId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in joinCommunityAction:", error);
    return { success: false, message: error.message || "Erro ao entrar na comunidade." };
  }
}

export async function leaveCommunityAction(communityId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const success = await repo.leaveCommunity(communityId, user.id);

    revalidatePath("/communities");
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error) {
    console.error("Error in leaveCommunityAction:", error);
    return { success: false, message: "Erro ao sair da comunidade." };
  }
}

export async function getChannelsAction(communityId: string): Promise<Channel[]> {
  try {
    const repo = await getRepository();
    return await repo.getChannels(communityId);
  } catch (error) {
    console.error("Error in getChannelsAction:", error);
    return [];
  }
}

export async function markChannelAsReadAction(channelId: string): Promise<void> {}

export async function getMessagesAction(channelId: string): Promise<CommunityMessage[]> {
  try {
    const repo = await getRepository();
    return await repo.getMessages(channelId);
  } catch (error) {
    console.error("Error in getMessagesAction:", error);
    return [];
  }
}

export async function sendMessageAction(channelId: string, content: string, mediaUrl?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const message = await repo.sendMessage(channelId, content, mediaUrl, user.id);
    return { success: true, data: message };
  } catch (error: any) {
    console.error("Error in sendMessageAction:", error);
    return { success: false, message: error.message || "Erro ao enviar mensagem." };
  }
}

export async function deleteMessageAction(channelId: string, messageId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const success = await repo.deleteMessage(channelId, messageId, user.id);
    return { success };
  } catch (error) {
    console.error("Error in deleteMessageAction:", error);
    return { success: false, message: "Erro ao excluir mensagem." };
  }
}


export async function getMembersAction(communityId: string): Promise<CommunityMember[]> {
  try {
    const repo = await getRepository();
    return await repo.getMembers(communityId);
  } catch (error) {
    console.error("Error in getMembersAction:", error);
    return [];
  }
}

export async function approveAccessAction(communityId: string, userId: string) {
  try {
    const repo = await getRepository();
    const success = await repo.approveAccess(communityId, userId);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error) {
    console.error("Error in approveAccessAction:", error);
    return { success: false };
  }
}

export async function rejectAccessAction(communityId: string, userId: string) {
  try {
    const repo = await getRepository();
    const success = await repo.rejectAccess(communityId, userId);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error) {
    console.error("Error in rejectAccessAction:", error);
    return { success: false };
  }
}

export async function kickMemberAction(communityId: string, userId: string) {
  try {
    const repo = await getRepository();
    const success = await repo.kickMember(communityId, userId);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error) {
    console.error("Error in kickMemberAction:", error);
    return { success: false };
  }
}

export async function updateMemberRoleAction(communityId: string, userId: string, newRole: RoleType) {
  try {
    const repo = await getRepository();
    const result = await repo.updateMemberRole(communityId, userId, newRole);
    revalidatePath(`/communities/${communityId}`);
    return result;
  } catch (error: any) {
    console.error("Error in updateMemberRoleAction:", error);
    return { success: false, message: error.message || "Erro ao atualizar cargo." };
  }
}

export async function createChannelAction(input: CreateChannelInput) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const parsed = CreateChannelInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const repo = await getRepository();
    const comm = await repo.getCommunityById(input.communityId, user.id);
    if (!comm || (comm.currentUserRole !== "OWNER" && comm.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas moderadores e proprietários podem criar canais." };
    }

    const channel = await repo.createChannel(parsed.data);
    revalidatePath(`/communities/${input.communityId}`);
    return { success: true, data: channel };
  } catch (error: any) {
    console.error("Error in createChannelAction:", error);
    return { success: false, message: error.message || "Erro ao criar canal." };
  }
}

export async function updateChannelAction(
  communityId: string,
  channelId: string,
  updates: { name?: string; topic?: string; isPrivate?: boolean; type?: string }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const comm = await repo.getCommunityById(communityId, user.id);
    if (!comm || (comm.currentUserRole !== "OWNER" && comm.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas moderadores e proprietários podem atualizar canais." };
    }

    const success = await repo.updateChannel(channelId, updates);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error: any) {
    console.error("Error in updateChannelAction:", error);
    return { success: false, message: error.message || "Erro ao atualizar canal." };
  }
}

export async function deleteChannelAction(communityId: string, channelId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const comm = await repo.getCommunityById(communityId, user.id);
    if (!comm || (comm.currentUserRole !== "OWNER" && comm.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas moderadores e proprietários podem excluir canais." };
    }

    const success = await repo.deleteChannel(channelId);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error: any) {
    console.error("Error in deleteChannelAction:", error);
    return { success: false, message: error.message || "Erro ao excluir canal." };
  }
}

export async function updateMessageAction(communityId: string, channelId: string, messageId: string, content: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const success = await repo.updateMessage(channelId, messageId, content, user.id);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error: any) {
    console.error("Error in updateMessageAction:", error);
    return { success: false, message: "Erro ao atualizar mensagem." };
  }
}

export async function togglePinMessageAction(communityId: string, channelId: string, messageId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const success = await repo.togglePinMessage(channelId, messageId);
    revalidatePath(`/communities/${communityId}`);
    return { success };
  } catch (error: any) {
    console.error("Error in togglePinMessageAction:", error);
    return { success: false, message: "Erro ao fixar mensagem." };
  }
}


export async function toggleHighlightMessageAction(communityId: string, channelId: string, messageId: string) {
  return { success: true };
}

export async function updateMemberPermissionsAction(communityId: string, userId: string, permissions: any) {
  return { success: true };
}

export async function generateInviteLinkAction(communityId: string) {
  try {
    const repo = await getRepository();
    const code = await repo.generateInviteLink(communityId);
    revalidatePath(`/communities/${communityId}`);
    return { success: true, code };
  } catch (error: any) {
    console.error("Error in generateInviteLinkAction:", error);
    return { success: false, message: "Erro ao gerar link de convite." };
  }
}

export async function updateChannelAccessAction(communityId: string, channelId: string, accessLevel: any) {
  return { success: true };
}

export async function getRolesAction(communityId: string): Promise<{ success: boolean; data?: any; message?: string }> {
  return { success: true, data: [] };
}

export async function createRoleAction(communityId: string, roleData: any): Promise<{ success: boolean; data?: any; message?: string }> {
  return { success: true, data: null };
}

export async function updateRoleAction(communityId: string, roleId: string, updates: any): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function deleteRoleAction(communityId: string, roleId: string): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function setMemberNicknameAction(communityId: string, userId: string, nickname: string): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function banMemberAction(communityId: string, userId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const comm = await repo.getCommunityById(communityId, user.id);
    if (!comm || (comm.currentUserRole !== "OWNER" && comm.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas moderadores e proprietários podem banir membros." };
    }

    await repo.banMember(communityId, userId, reason);
    revalidatePath(`/communities/${communityId}`);
    return { success: true, message: "Membro banido." };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao banir membro." };
  }
}

export async function unbanMemberAction(communityId: string, userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = await getRepository();
    const comm = await repo.getCommunityById(communityId, user.id);
    if (!comm || (comm.currentUserRole !== "OWNER" && comm.currentUserRole !== "MODERATOR")) {
      return { success: false, message: "Apenas moderadores e proprietários podem desbanir membros." };
    }

    await repo.unbanMember(communityId, userId);
    revalidatePath(`/communities/${communityId}`);
    return { success: true, message: "Membro desbanido." };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao desbanir membro." };
  }
}

export async function getBannedMembersAction(communityId: string): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const repo = await getRepository();
    const data = await repo.getBannedMembers(communityId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao carregar banidos." };
  }
}


export async function muteMemberAction(communityId: string, userId: string, durationMinutes: number, reason?: string): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function unmuteMemberAction(communityId: string, userId: string): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function createPollAction(communityId: string, question: string, options: string[], channelId?: string, durationHours: number = 24): Promise<{ success: boolean; data?: any; message?: string }> {
  return { success: true, data: null };
}

export async function votePollAction(communityId: string, pollId: string, optionIndex: number): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

export async function getPollsAction(communityId: string, channelId?: string): Promise<{ success: boolean; data?: any; message?: string }> {
  return { success: true, data: [] };
}

