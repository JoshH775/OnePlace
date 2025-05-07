import { ProtoUser, User } from "../../../shared/types"
import { db } from "../initDB"
import { usersTable } from "../schema"

export class UsersRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.email, email)
        })

        return user ? { ...user, createdAt: user.createdAt.toISOString() } : null
    }

    async findById(id: number): Promise<User | null> {
        const user = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.id, id)
        });

        return user ? { ...user, createdAt: user.createdAt.toISOString() } : null;
    }

    // async create(user: ProtoUser): Promise<User> {
    //     const result = await db.insert(usersTable).values({
    //         email: user.email!,
    //         password: user.password ?? '',
    //     })

    //     return {
    //         id: result[0].insertId,
    //         email: user.email,
    //         password: user.password,
    //         createdAt: new Date()
    //     }
    // }
}
