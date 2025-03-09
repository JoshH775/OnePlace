import { Collection, ProtoCollection } from "@shared/types";
import { db } from "../initDB";
import { collectionsTable } from "../schema";
import { eq } from "drizzle-orm";

export default class CollectionsRepository {
  async createCollection(options: {
    name: string;
    userId: number;
    description?: string;
  }) {
    await db.insert(collectionsTable).values(options);
  }

  async getCollectionsForUser(userId: number): Promise<Collection[] | null> {
    try {
      const collections = await db.query.collectionsTable.findMany({
        where: (collections, { eq }) => eq(collections.userId, userId),
      });

      return collections;
    } catch (error) {
      console.error("Error getting collections:", error);
      return null;
    }
  }

  async getCollectionById(id: number, userId: number): Promise<Collection | null> {
    const collection = await db.query.collectionsTable.findFirst({
      where: (collection, { and, eq }) => and(eq(collection.userId, userId), eq(collection.id, id)),
    });

    return collection ?? null;
  }

  async updateCollection(options: ProtoCollection & { id: number }): Promise<boolean> {
    try {
      await db.update(collectionsTable).set(options).where(eq(collectionsTable.id, options.id));
      return true;
    } catch (error) {
      console.error("Error updating collection:", error);
      return false;
    }
  }
}
