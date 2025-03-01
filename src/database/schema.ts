import {
  boolean,
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

const photosTable = mysqlTable("photos", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .references(() => usersTable.id)
    .notNull(),
  filename: text().notNull(),
  alias: varchar({ length: 255 }),
  type: varchar({ length: 255 }).notNull(),
  size: int().notNull(),
  location: text(),
  googleId: varchar({ length: 255 }).unique(),
  date: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  lastAccessed: timestamp().defaultNow().notNull(),
  compressed: boolean().default(false).notNull(),
});

const googleIntegrationsTable = mysqlTable("google_integrations", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .references(() => usersTable.id)
    .notNull(),
  googleId: varchar({ length: 255 }).notNull().unique(),
  accessToken: text().notNull(),
  refreshToken: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

const userSettingsTable = mysqlTable(
  "user_settings",
  {
    userId: int()
      .references(() => usersTable.id)
      .notNull(),
    key: varchar({ length: 255 }).notNull(),
    value: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })]
);


const globalSettingsTable = mysqlTable("global_settings", {
  id: int().autoincrement().primaryKey(),
  key: varchar({ length: 255 }).notNull(),
  value: text().notNull(),
});


export {
  usersTable,
  photosTable,
  googleIntegrationsTable,
  userSettingsTable,
  globalSettingsTable,
};
