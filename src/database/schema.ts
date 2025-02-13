import { relations } from "drizzle-orm"
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"

const usersTable = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  email: varchar({length: 255}).notNull().unique(),
  password: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})

// const usersRelations = relations(usersTable, ({ many }) => ({
//     photos: many(photosTable)
// }))

const photosTable = mysqlTable('photos', {
  id: int().autoincrement().primaryKey(),
  userId: int().references(() => usersTable.id).notNull(),
  url: text().notNull(),
  filename: text(),
  size: int(),
  alias: varchar({length: 255}),
  googleId: varchar({length: 255}).unique(),
  createdAt: timestamp().defaultNow().notNull(),
  lastAccessed: timestamp().defaultNow().notNull(),
})

const googleIntegrationsTable = mysqlTable('google_integrations', {
  id: int().autoincrement().primaryKey(),
  userId: int().references(() => usersTable.id).notNull(),
  googleId: varchar({length: 255}).notNull().unique(),
  accessToken: text().notNull(),
  refreshToken: text(),
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
  // photosTable,
  googleIntegrationsTable,
//   usersRelations,
//   photosRelations,
}
