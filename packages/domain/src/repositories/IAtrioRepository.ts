import { AtrioItem, AtrioList } from "../schemas/atrio";

export interface IAtrioRepository {
  getItems(): Promise<AtrioItem[]>;
  getItemsByIds(ids: string[]): Promise<AtrioItem[]>;
  getUserItems(userId: string): Promise<AtrioItem[]>;
  addItem(
    item: Omit<AtrioItem, "id" | "vibes" | "authorId" | "authorName" | "authorAvatar" | "dbId">
  ): Promise<AtrioItem>;
  updateItem(id: string, updates: Partial<AtrioItem>): Promise<AtrioItem | null>;
  deleteItem(id: string): Promise<boolean>;

  getLists(userId?: string): Promise<AtrioList[]>;
  createList(name: string, description?: string, tags?: string[], userId?: string): Promise<AtrioList>;
  updateList(id: string, updates: { name?: string; description?: string; tags?: string[] }, userId?: string): Promise<boolean>;
  deleteList(id: string, userId?: string): Promise<boolean>;


  addItemToList(listId: string, itemId: string): Promise<void>;
  removeItemFromList(listId: string, itemId: string): Promise<void>;
  incrementVibes(itemId: string): Promise<void>;
}
