import { describe, it, expect, beforeEach } from "vitest";

export interface SantuarioList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverItemId?: string;
  createdAt: string;
}

export interface SantuarioListItem {
  id: string;
  listId: string;
  itemId: string;
  createdAt: string;
}

export interface SantuarioCollaborator {
  id: string;
  listId: string;
  userId: string;
  permission: "VIEWER" | "EDITOR";
  createdAt: string;
}

export class InMemorySantuarioRepository {
  public lists: SantuarioList[] = [];
  public listItems: SantuarioListItem[] = [];
  public collaborators: SantuarioCollaborator[] = [];

  createList(userId: string, name: string, description: string = "", initialItemId?: string): SantuarioList {
    if (!name.trim()) throw new Error("Nome da lista é obrigatório.");

    const list: SantuarioList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      name: name.trim(),
      description: description.trim(),
      coverItemId: initialItemId || undefined,
      createdAt: new Date().toISOString(),
    };

    this.lists.push(list);

    if (initialItemId) {
      this.addItemToList(list.id, initialItemId, userId);
    }

    return list;
  }

  updateList(listId: string, userId: string, name: string, description: string = ""): SantuarioList {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");
    if (list.userId !== userId) throw new Error("Sem permissão para atualizar esta lista.");

    list.name = name.trim();
    list.description = description.trim();
    return list;
  }

  deleteList(listId: string, userId: string): boolean {
    const listIndex = this.lists.findIndex((l) => l.id === listId);
    if (listIndex === -1) throw new Error("Lista não encontrada.");

    if (this.lists[listIndex].userId !== userId) {
      throw new Error("Sem permissão para excluir esta lista.");
    }

    this.lists.splice(listIndex, 1);
    this.listItems = this.listItems.filter((i) => i.listId !== listId);
    this.collaborators = this.collaborators.filter((c) => c.listId !== listId);
    return true;
  }

  setCoverItem(listId: string, itemId: string, userId: string): SantuarioList {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");

    const hasAccess =
      list.userId === userId ||
      this.collaborators.some((c) => c.listId === listId && c.userId === userId && c.permission === "EDITOR");

    if (!hasAccess) throw new Error("Sem permissão para alterar a capa da lista.");

    const itemExists = this.listItems.some((i) => i.listId === listId && i.itemId === itemId);
    if (!itemExists) throw new Error("A obra precisa pertencer à lista para ser definida como capa.");

    list.coverItemId = itemId;
    return list;
  }

  addItemToList(listId: string, itemId: string, actorUserId: string): SantuarioListItem {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");

    const isOwner = list.userId === actorUserId;
    const editor = this.collaborators.find((c) => c.listId === listId && c.userId === actorUserId);
    const isEditor = editor?.permission === "EDITOR";

    if (!isOwner && !isEditor) {
      throw new Error("Apenas o proprietário ou colaboradores com permissão EDITOR podem adicionar itens.");
    }

    const alreadyInList = this.listItems.some((i) => i.listId === listId && i.itemId === itemId);
    if (alreadyInList) throw new Error("Esta obra já está salva na lista.");

    const item: SantuarioListItem = {
      id: `item-rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      listId,
      itemId,
      createdAt: new Date().toISOString(),
    };

    this.listItems.push(item);

    if (!list.coverItemId) {
      list.coverItemId = itemId;
    }

    return item;
  }

  removeItemFromList(listId: string, itemId: string, actorUserId: string): boolean {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");

    const isOwner = list.userId === actorUserId;
    const editor = this.collaborators.find((c) => c.listId === listId && c.userId === actorUserId);
    const isEditor = editor?.permission === "EDITOR";

    if (!isOwner && !isEditor) {
      throw new Error("Apenas o proprietário ou colaboradores com permissão EDITOR podem remover itens.");
    }

    const idx = this.listItems.findIndex((i) => i.listId === listId && i.itemId === itemId);
    if (idx === -1) return false;

    this.listItems.splice(idx, 1);

    if (list.coverItemId === itemId) {
      const remaining = this.listItems.filter((i) => i.listId === listId);
      list.coverItemId = remaining.length > 0 ? remaining[0].itemId : undefined;
    }

    return true;
  }

  addCollaborator(
    listId: string,
    ownerUserId: string,
    targetUserId: string,
    permission: "VIEWER" | "EDITOR"
  ): SantuarioCollaborator {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");
    if (list.userId !== ownerUserId) throw new Error("Apenas o proprietário pode gerenciar colaboradores.");
    if (ownerUserId === targetUserId) throw new Error("O proprietário não pode ser adicionado como colaborador.");

    const existingIdx = this.collaborators.findIndex((c) => c.listId === listId && c.userId === targetUserId);
    if (existingIdx !== -1) {
      this.collaborators[existingIdx].permission = permission;
      return this.collaborators[existingIdx];
    }

    const collaborator: SantuarioCollaborator = {
      id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      listId,
      userId: targetUserId,
      permission,
      createdAt: new Date().toISOString(),
    };

    this.collaborators.push(collaborator);
    return collaborator;
  }

  removeCollaborator(listId: string, ownerUserId: string, targetUserId: string): boolean {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada.");
    if (list.userId !== ownerUserId) throw new Error("Apenas o proprietário pode remover colaboradores.");

    const idx = this.collaborators.findIndex((c) => c.listId === listId && c.userId === targetUserId);
    if (idx === -1) return false;

    this.collaborators.splice(idx, 1);
    return true;
  }
}

describe("CRUD do Santuário (Listas de Favoritos do Átrio e Colaboradores)", () => {
  let repo: InMemorySantuarioRepository;
  const ownerId = "user-owner-1";
  const friendViewerId = "user-friend-viewer";
  const friendEditorId = "user-friend-editor";
  const item1 = "atrio-item-1";
  const item2 = "atrio-item-2";
  const item3 = "atrio-item-3";

  beforeEach(() => {
    repo = new InMemorySantuarioRepository();
  });

  describe("Criação e Edição de Listas", () => {
    it("deve criar uma nova lista do Santuário com sucesso", () => {
      const list = repo.createList(ownerId, "Paz e Harmonia", "Minhas fotos contemplativas");
      expect(list.id).toBeDefined();
      expect(list.name).toBe("Paz e Harmonia");
      expect(list.description).toBe("Minhas fotos contemplativas");
      expect(list.userId).toBe(ownerId);
    });

    it("deve lançar erro ao tentar criar lista com nome em branco", () => {
      expect(() => repo.createList(ownerId, "   ")).toThrow("Nome da lista é obrigatório.");
    });

    it("deve atualizar nome e descrição da lista", () => {
      const list = repo.createList(ownerId, "Nome Antigo", "Desc Antiga");
      const updated = repo.updateList(list.id, ownerId, "Nome Novo", "Desc Nova");

      expect(updated.name).toBe("Nome Novo");
      expect(updated.description).toBe("Desc Nova");
    });
  });

  describe("Gerenciamento de Itens e Escolha de Capa por Estrela", () => {
    it("deve adicionar obras à lista e definir o primeiro item como capa padrão", () => {
      const list = repo.createList(ownerId, "Inspirações");
      repo.addItemToList(list.id, item1, ownerId);

      expect(repo.listItems.length).toBe(1);
      expect(list.coverItemId).toBe(item1);
    });

    it("deve alterar a capa da lista via Ícone de Estrela para outra obra da mesma lista", () => {
      const list = repo.createList(ownerId, "Coleção Átrio");
      repo.addItemToList(list.id, item1, ownerId);
      repo.addItemToList(list.id, item2, ownerId);

      expect(list.coverItemId).toBe(item1);

      // Clica na estrela do item 2
      const updatedList = repo.setCoverItem(list.id, item2, ownerId);
      expect(updatedList.coverItemId).toBe(item2);
    });

    it("deve proibir definir como capa um item que não pertence à lista", () => {
      const list = repo.createList(ownerId, "Coleção Átrio");
      repo.addItemToList(list.id, item1, ownerId);

      expect(() => repo.setCoverItem(list.id, item3, ownerId)).toThrow(
        "A obra precisa pertencer à lista para ser definida como capa."
      );
    });

    it("deve remover obra da lista e atualizar a capa se o item removido era a capa", () => {
      const list = repo.createList(ownerId, "Lista Temporária");
      repo.addItemToList(list.id, item1, ownerId);
      repo.addItemToList(list.id, item2, ownerId);

      expect(list.coverItemId).toBe(item1);

      repo.removeItemFromList(list.id, item1, ownerId);
      expect(repo.listItems.length).toBe(1);
      expect(list.coverItemId).toBe(item2);
    });
  });

  describe("Colaboração Cooperativa e Permissões (VIEWER vs EDITOR)", () => {
    it("deve permitir adicionar um colaborador VIEWER (apenas visualização)", () => {
      const list = repo.createList(ownerId, "Lista Compartilhada");
      const collab = repo.addCollaborator(list.id, ownerId, friendViewerId, "VIEWER");

      expect(collab.permission).toBe("VIEWER");
      expect(collab.userId).toBe(friendViewerId);
    });

    it("deve permitir que colaborador EDITOR adicione e remova obras na lista", () => {
      const list = repo.createList(ownerId, "Lista Cooperativa");
      repo.addCollaborator(list.id, ownerId, friendEditorId, "EDITOR");

      // Friend Editor adiciona item 1
      const addedItem = repo.addItemToList(list.id, item1, friendEditorId);
      expect(addedItem).toBeDefined();
      expect(repo.listItems.length).toBe(1);

      // Friend Editor remove item 1
      const removed = repo.removeItemFromList(list.id, item1, friendEditorId);
      expect(removed).toBe(true);
      expect(repo.listItems.length).toBe(0);
    });

    it("deve proibir que colaborador VIEWER adicione ou remova obras da lista", () => {
      const list = repo.createList(ownerId, "Lista Apenas Leitura");
      repo.addCollaborator(list.id, ownerId, friendViewerId, "VIEWER");

      expect(() => repo.addItemToList(list.id, item1, friendViewerId)).toThrow(
        "Apenas o proprietário ou colaboradores com permissão EDITOR podem adicionar itens."
      );
    });

    it("deve remover um colaborador da lista", () => {
      const list = repo.createList(ownerId, "Lista Grupo");
      repo.addCollaborator(list.id, ownerId, friendEditorId, "EDITOR");

      const removed = repo.removeCollaborator(list.id, ownerId, friendEditorId);
      expect(removed).toBe(true);
      expect(repo.collaborators.length).toBe(0);
    });
  });

  describe("Exclusão de Lista (Cascade)", () => {
    it("deve excluir a lista e remover todos os vínculos de itens e colaboradores", () => {
      const list = repo.createList(ownerId, "Para Apagar");
      repo.addItemToList(list.id, item1, ownerId);
      repo.addItemToList(list.id, item2, ownerId);
      repo.addCollaborator(list.id, ownerId, friendEditorId, "EDITOR");

      expect(repo.lists.length).toBe(1);
      expect(repo.listItems.length).toBe(2);
      expect(repo.collaborators.length).toBe(1);

      const deleted = repo.deleteList(list.id, ownerId);
      expect(deleted).toBe(true);

      expect(repo.lists.length).toBe(0);
      expect(repo.listItems.length).toBe(0);
      expect(repo.collaborators.length).toBe(0);
    });
  });
});
