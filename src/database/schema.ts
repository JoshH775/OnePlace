import { relations } from "drizzle-orm"
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"

const usersTable = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  email: varchar({length: 255}).notNull().unique(),
  password: text(),
  provider: text().notNull(),
  providerId: text(),
  createdAt: timestamp().defaultNow().notNull(),
})

// const usersRelations = relations(usersTable, ({ many }) => ({
//     photos: many(photosTable)
// }))

const photosTable = mysqlTable('photos', {
  id: int().autoincrement().primaryKey(),
  userId: int().references(() => usersTable.id),
  url: text().notNull(),
})

const googleIntegrationsTable = mysqlTable('google_integrations', {
  id: int().autoincrement().primaryKey(),
  userId: int().references(() => usersTable.id).notNull(),
  googleId: varchar({length: 255}).notNull(),
  accessToken: text().notNull(),
  refreshToken: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})

// const photosRelations = relations(photosTable, ({ one }) => ({
//     owner: one(usersTable, {
//         fields: [photosTable.userId],
//         references: [usersTable.id]
//     })
// }))

// Define relationships


export {
  usersTable,
  photosTable,
  googleIntegrationsTable,
//   usersRelations,
//   photosRelations,
}
