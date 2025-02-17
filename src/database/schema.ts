import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"

const usersTable = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  email: varchar({length: 255}).notNull().unique(),
  password: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})


const photosTable = mysqlTable('photos', {
  id: int().autoincrement().primaryKey(),
  userId: int().references(() => usersTable.id).notNull(),
  url: text().notNull(),
  filename: text().notNull(),
  alias: varchar({length: 255}),
  type: varchar({length: 255}).notNull(),
  size: int().notNull(),
  width: int().notNull(),
  height: int().notNull(),
  location: text(),
  googleId: varchar({length: 255}).unique(),
  date: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  lastAccessed: timestamp().defaultNow().notNull(),
  compressed: int().notNull().default(0),
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

export interface Photo {
  id: number;
  userId: number;
  url: string;
  filename: string;
  size: number;
  alias: string | null;
  type: string;
  width: number;
  height: number;
  location: string | null;
  date: Date | null;
  googleId: string | null;
  createdAt: Date;
  lastAccessed: Date;
  compressed: number;
}



export {
  usersTable,
  photosTable,
  googleIntegrationsTable,
}
