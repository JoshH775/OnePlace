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

    async create(user: ProtoUser): Promise<User> {
        const result = await db.insert(usersTable).values({
            email: user.email!,
            password: user.password ?? '',
            provider: user.provider ?? '',
            providerId: user.providerId ?? ''
        })

        return {
            id: result[0].insertId,
            email: user.email,
            password: user.password,
            provider: user.provider,
            providerId: user.providerId,
            createdAt: new Date()
        }
    }
}


export type User = {
    id: number
    email: string
    password: string | null
    provider: string | null
    providerId: string | null
    createdAt: Date
}

type ProtoUser = {
    email: string
    password: string | null
    provider: string | null
    providerId: string | null
}