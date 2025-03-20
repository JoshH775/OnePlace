import {
  boolean,
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  unique,
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
  date: timestamp({ mode: 'string'}),
  createdAt: timestamp({ mode: 'string'}).defaultNow().notNull(),
  lastAccessed: timestamp({ mode: 'string'}).defaultNow().notNull(),
  compressed: boolean().default(false).notNull(),
});

const googleIntegrationsTable = mysqlTable("google_integrations", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .references(() => usersTable.id)
    .notNull(),
  email: text().notNull(),
  googleId: varchar({ length: 255 }).notNull().unique(),
  accessToken: text().notNull(),
  refreshToken: text().notNull(),
  createdAt: timestamp({ mode: 'string'}).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string'}).defaultNow().notNull(),
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

const collectionsTable = mysqlTable("collections", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .references(() => usersTable.id)
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  coverPhotoId: int()
    .references(() => photosTable.id, { onDelete: "set null"}),
  createdAt: timestamp({ mode: 'string'}).defaultNow().notNull(),
  updatedAt: timestamp({mode: 'string'}).defaultNow().notNull(),
  lastAccessed: timestamp({mode: 'string'}).defaultNow().notNull(),
});

const collectionPhotosTable = mysqlTable("collection_photos", {
  collectionId: int()
    .references(() => collectionsTable.id, { onDelete: 'cascade', onUpdate: 'cascade'})
    .notNull(),
  photoId: int()
    .references(() => photosTable.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
});

const globalSettingsTable = mysqlTable("global_settings", {
  id: int().autoincrement().primaryKey(),
  key: varchar({ length: 255 }).notNull(),
  value: text().notNull(),
});

const tagsTable = mysqlTable("tags", {
  id: int().autoincrement().primaryKey(),
  userId: int().notNull()
    .references(() => usersTable.id),
  color: varchar({ length: 255 }),
  name: varchar({ length: 255 }).notNull().unique(),
},
(table) => [
  unique().on(table.userId, table.name),
]);

const photoTagsTable = mysqlTable("photo_tags", {
  photoId: int()
    .references(() => photosTable.id, { onDelete: 'cascade', onUpdate: 'cascade'})
    .notNull(),
  tagId: int()
    .references(() => tagsTable.id, { onDelete: 'cascade', onUpdate: 'cascade'})
    .notNull(),
}, (table) => [primaryKey({ columns: [table.photoId, table.tagId] })]);



export {
  usersTable,
  photosTable,
  googleIntegrationsTable,
  userSettingsTable,
  globalSettingsTable,
  collectionsTable,
  collectionPhotosTable,
  tagsTable,
  photoTagsTable,
};
