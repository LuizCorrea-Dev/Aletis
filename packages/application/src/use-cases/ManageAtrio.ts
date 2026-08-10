import { IAtrioRepository, AtrioItem, AtrioList } from "@aletis/domain";

export class ManageAtrioUseCase {
  constructor(private readonly atrioRepository: IAtrioRepository) { }

  getItems(): Promise<AtrioItem[]> {
    return this.atrioRepository.getItems();
  }

  getItemsByIds(ids: string[]): Promise<AtrioItem[]> {
    return this.atrioRepository.getItemsByIds(ids);
  }

  getUserItems(userId: string): Promise<AtrioItem[]> {
    return this.atrioRepository.getUserItems(userId);
  }

  addItem(
    item: Omit<AtrioItem, "id" | "vibes" | "authorId" | "authorName" | "authorAvatar" | "dbId">
  ): Promise<AtrioItem> {
    return this.atrioRepository.addItem(item);
  }

  updateItem(id: string, updates: Partial<AtrioItem>): Promise<AtrioItem | null> {
    return this.atrioRepository.updateItem(id, updates);
  }

  deleteItem(id: string): Promise<boolean> {
    return this.atrioRepository.deleteItem(id);
  }

  getLists(): Promise<AtrioList[]> {
    return this.atrioRepository.getLists();
  }

  createList(name: string, description?: string, tags?: string[]): Promise<AtrioList> {
    return this.atrioRepository.createList(name, description, tags);
  }

  updateList(
    id: string,
    updates: { name?: string; description?: string; tags?: string[] },
    userId?: string
  ): Promise<boolean> {
    return this.atrioRepository.updateList(id, updates, userId);
  }

  deleteList(id: string, userId?: string): Promise<boolean> {
    return this.atrioRepository.deleteList(id, userId);
  }


  addItemToList(listId: string, itemId: string): Promise<void> {
    return this.atrioRepository.addItemToList(listId, itemId);
  }

  removeItemFromList(listId: string, itemId: string): Promise<void> {
    return this.atrioRepository.removeItemFromList(listId, itemId);
  }

  incrementVibes(itemId: string): Promise<void> {
    return this.atrioRepository.incrementVibes(itemId);
  }
}
