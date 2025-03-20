import { Tag } from "@shared/types";
import { db } from "../initDB";
import { tagsTable } from "../schema";
import { and, eq } from "drizzle-orm";

export default class TagsRepository {

    async getTagsForUser(userId: number): Promise<Tag[]> {
        return await db.query.tagsTable.findMany({
            where: (tags, { eq }) => eq(tags.userId, userId),
            columns: {
                id: true,
                name: true,
                color: true
            }
        });
    }

    async getById(userId: number, id: number): Promise<Tag | null> {
        return await db.query.tagsTable.findFirst({
            where: (tags, { and, eq }) => and(eq(tags.userId, userId), eq(tags.id, id)),
            columns: {
                id: true,
                name: true,
                color: true
            }
        }) ?? null;
    }

    async getByName(userId: number, name: string): Promise<Tag | null> {
        return await db.query.tagsTable.findFirst({
            where: (tags, { and, eq }) => and(eq(tags.userId, userId), eq(tags.name, name)),
            columns: {
                id: true,
                name: true,
                color: true}
        }) ?? null;
    }

    async create(userId: number, data: { name: string, color?: string}): Promise<number> {
        const id = await db.insert(tagsTable).values({ userId, ...data }).$returningId();
        return id[0].id;
    }

    async update(userId: number, id: number, data: { name?: string, color?: string }): Promise<void> {
        await db.update(tagsTable).set(data).where(and(eq(tagsTable.userId, userId), eq(tagsTable.id, id)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(tagsTable).where(eq(tagsTable.id, id));
    }

    




}