import { Collection } from "@shared/types";
import { db } from "../initDB";
import { collectionPhotosTable, collectionsTable } from "../schema";
import { eq } from "drizzle-orm";

export default class CollectionsRepository {

  async create(options: {
    name: string;
    userId: number;
    description?: string;
  }): Promise<Collection> {
    await db.insert(collectionsTable).values(options);
    const collection = await db.query.collectionsTable.findFirst({
      where: (collection, { and, eq }) => and(eq(collection.name, options.name), eq(collection.userId, options.userId)),
    });
    return collection!;
  }

  async getCollectionsForUser(userId: number, query?: string): Promise<Collection[] | null> {

    try {
      const collections = await db.query.collectionsTable.findMany({
        where: (collections, { eq, like, and, or }) => {
          if (query && query.length > 0) {
            return and(eq(collections.userId, userId), or(like(collections.name, `%${query}%`), like(collections.description, `%${query}%`)));
          }
          return eq(collections.userId, userId);
        }
      });

      return collections;
    } catch (error) {
      console.error("Error getting collections:", error);
      return null;
    }
  }

  async getById(id: number, userId: number): Promise<Collection | null> {
    const collection = await db.query.collectionsTable.findFirst({
      where: (collection, { and, eq }) => and(eq(collection.userId, userId), eq(collection.id, id)),
    });

    return collection ?? null;
  }

  async update(collection: Collection): Promise<boolean> {
    await db.update(collectionsTable).set(collection).where(eq(collectionsTable.id, collection.id));
    return true;
  }

  async addPhotosToCollection(collectionId: number, photoIds: number[]): Promise<boolean> {
    await db.insert(collectionPhotosTable).values(photoIds.map(photoId => ({ collectionId, photoId })));
    return true;
  }

  async delete(collectionId: number) {
    await db.delete(collectionsTable).where(eq(collectionsTable.id, collectionId));
  }
}
