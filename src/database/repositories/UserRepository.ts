import { Collection, Photo, ProtoUser, User } from "../../../shared/types"
import { db } from "../initDB"
import { usersTable } from "../schema"

export class UsersRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.email, email)
        })

        return user ?? null
    }

    async findById(id: number): Promise<User | null> {
        return await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.id, id)
        }) ?? null
    }

    async getLastAccessed(id: number): Promise<(Collection | Photo)[]> {
        const photos = await db.query.photosTable.findMany({
            where: (photos, { eq }) => eq(photos.userId, id),
            orderBy: (photos, { desc }) => [desc(photos.lastAccessed)],
            limit: 5
        })

        const collections = await db.query.collectionsTable.findMany({
            where: (collections, { eq }) => eq(collections.userId, id),
            orderBy: (collections, { desc }) => [desc(collections.lastAccessed)],
            limit: 5
        })

        const photosWithType = photos.map(photo => ({ ...photo, type: "photo" }))
        const collectionsWithType = collections.map(collection => ({ ...collection, type: "collection" }))

        const lastAccessed = [...photosWithType, ...collectionsWithType]
        lastAccessed.sort((a, b) => {
            const dateA = new Date(a.lastAccessed).getTime()
            const dateB = new Date(b.lastAccessed).getTime()
            return dateB - dateA
        })

        return lastAccessed
    }

}
