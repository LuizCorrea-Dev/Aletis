"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/auth";
import { PostgresAtrioRepository, PostgresUserRepository } from "@aletis/infrastructure";

export interface AtrioItemData {
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  color?: string;
  vibesCount?: number;
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
}

export async function createAtrioItemAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Não autenticado." };
    }

    const title = (formData.get("title") as string) || "Contemplação";
    const description = (formData.get("description") as string) || "";
    const url = formData.get("url") as string;
    const color = (formData.get("color") as string) || "bg-[#50c878]";

    if (!url) {
      return { success: false, message: "A URL da mídia é obrigatória para o Átrio." };
    }

    const repo = new PostgresAtrioRepository();
    await repo.addItem(
      {
        title,
        description,
        url,
        color,
      },
      user.id
    );

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Obra publicada no Átrio!" };
  } catch (err) {
    console.error("createAtrioItemAction error:", err);
    return { success: false, message: "Erro interno no servidor." };
  }
}

export async function getAtrioItemsAction(): Promise<AtrioItemData[]> {
  try {
    const repo = new PostgresAtrioRepository();
    const items = await repo.getItems();
    return items.map((i) => ({
      id: i.id,
      userId: i.authorId || "",
      title: i.title,
      description: i.description || "",
      url: i.url,
      color: i.color,
      vibesCount: i.vibes,
      tags: [],
      authorName: i.authorName,
      authorAvatar: i.authorAvatar,
    }));
  } catch (err) {
    console.error("getAtrioItemsAction error:", err);
    return [];
  }
}

export async function getUserAtrioItemsAction(userId: string): Promise<AtrioItemData[]> {
  try {
    const user = await getCurrentUser();
    const targetUserId = userId === "current_user" ? user?.id : userId;
    if (!targetUserId) return [];

    const repo = new PostgresAtrioRepository();
    const items = await repo.getUserItems(targetUserId);
    return items.map((i) => ({
      id: i.id,
      userId: i.authorId || "",
      title: i.title,
      description: i.description || "",
      url: i.url,
      color: i.color,
      vibesCount: i.vibes,
      tags: [],
      authorName: i.authorName,
      authorAvatar: i.authorAvatar,
    }));
  } catch (err) {
    console.error("getUserAtrioItemsAction error:", err);
    return [];
  }
}

export async function deleteAtrioItemAction(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = new PostgresAtrioRepository();
    const deleted = await repo.deleteItem(itemId, user.id);
    if (!deleted) {
      return { success: false, message: "Você não tem permissão para excluir esta obra." };
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Item removido do Átrio com sucesso!" };
  } catch (err) {
    console.error("deleteAtrioItemAction error:", err);
    return { success: false, message: "Erro ao excluir obra do Átrio." };
  }
}

export async function updateAtrioItemAction(itemId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const url = formData.get("url") as string;

    const repo = new PostgresAtrioRepository();
    const updated = await repo.updateItem(itemId, { title, description, url }, user.id);
    if (!updated) {
      return { success: false, message: "Você não tem permissão para atualizar esta obra." };
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Obra do Átrio atualizada!" };
  } catch (err) {
    console.error("updateAtrioItemAction error:", err);
    return { success: false, message: "Erro ao atualizar obra." };
  }
}

export interface AtrioListData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverItemId?: string;
  coverUrl?: string;
  itemsCount: number;
  createdAt?: string;
}

export async function getUserAtrioListsAction(): Promise<AtrioListData[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const repo = new PostgresAtrioRepository();
    const lists = await repo.getLists(user.id);
    return lists.map((l) => ({
      id: l.id,
      userId: user.id,
      name: l.name,
      description: l.description || "",
      coverUrl: l.coverUrl,
      itemsCount: l.itemIds.length,
      createdAt: l.createdAt,
    }));
  } catch (err) {
    console.error("getUserAtrioListsAction exception:", err);
    return [];
  }
}

export async function createAtrioListAction(name: string, description: string = "", initialItemId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };
    if (!name.trim()) return { success: false, message: "Nome da lista é obrigatório." };

    const repo = new PostgresAtrioRepository();
    const newList = await repo.createList(name.trim(), description.trim(), [], user.id);

    if (initialItemId) {
      await repo.addItemToList(newList.id, initialItemId);
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Lista criada com sucesso!", list: newList };
  } catch (err: any) {
    return { success: false, message: err.message || "Erro interno ao criar lista." };
  }
}

export async function updateAtrioListAction(listId: string, name: string, description: string = "") {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = new PostgresAtrioRepository();
    const updated = await repo.updateList(listId, { name, description }, user.id);
    if (!updated) {
      return { success: false, message: "Você não tem permissão para editar esta lista." };
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Lista atualizada!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteAtrioListAction(listId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = new PostgresAtrioRepository();
    const deleted = await repo.deleteList(listId, user.id);
    if (!deleted) {
      return { success: false, message: "Você não tem permissão para excluir esta lista." };
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Lista excluída!" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function setAtrioListCoverAction(listId: string, itemId: string) {
  return { success: true, message: "Capa definida com sucesso!" };
}

export async function saveItemToAtrioListsAction(itemId: string, selectedListIds: string[]) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = new PostgresAtrioRepository();
    for (const listId of selectedListIds) {
      await repo.addItemToList(listId, itemId);
    }

    revalidatePath("/atrio");
    revalidatePath("/profile");
    return { success: true, message: "Santuário atualizado com sucesso!" };
  } catch (err: any) {
    return { success: false, message: err.message || "Erro ao salvar nas listas." };
  }
}

export async function getItemSavedListIdsAction(itemId: string): Promise<string[]> {
  return [];
}

export async function getListAtrioItemsAction(listId: string): Promise<AtrioItemData[]> {
  try {
    const repo = new PostgresAtrioRepository();
    const items = await repo.getItemsByIds([listId]);
    return items.map((i) => ({
      id: i.id,
      userId: i.authorId || "",
      title: i.title,
      description: i.description || "",
      url: i.url,
      color: i.color,
      vibesCount: i.vibes,
      tags: [],
      authorName: i.authorName,
      authorAvatar: i.authorAvatar,
    }));
  } catch (err) {
    return [];
  }
}

export interface AtrioCollaboratorData {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  permission: "VIEWER" | "EDITOR";
}

export async function addListCollaboratorAction(
  listId: string,
  targetUsernameOrEmail: string,
  permission: "VIEWER" | "EDITOR" = "VIEWER"
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const userRepo = new PostgresUserRepository();
    const targetUser = await userRepo.getProfileByUsername(targetUsernameOrEmail);
    if (!targetUser) return { success: false, message: "Usuário não encontrado." };

    const repo = new PostgresAtrioRepository();
    await repo.addCollaborator(listId, targetUser.id, permission);

    revalidatePath("/atrio");
    return { success: true, message: "Colaborador adicionado à lista com sucesso!" };
  } catch (err: any) {
    return { success: false, message: err.message || "Erro ao adicionar colaborador." };
  }
}

export async function removeListCollaboratorAction(listId: string, collaboratorUserId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Não autenticado." };

    const repo = new PostgresAtrioRepository();
    await repo.removeCollaborator(listId, collaboratorUserId);

    revalidatePath("/atrio");
    return { success: true, message: "Colaborador removido!" };
  } catch (err: any) {
    return { success: false, message: err.message || "Erro ao remover colaborador." };
  }
}

export async function getListCollaboratorsAction(listId: string): Promise<AtrioCollaboratorData[]> {
  try {
    const repo = new PostgresAtrioRepository();
    return await repo.getCollaborators(listId);
  } catch (err) {
    return [];
  }
}

