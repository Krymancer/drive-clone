import { int, text, singlestoreTableCreator, index, bigint, timestamp } from 'drizzle-orm/singlestore-core';

export const createTable = singlestoreTableCreator(
  (name) => `drive-clone_${name}`,
);

export const fileSchema = createTable('files', {
  id: bigint('id', { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  size: int('size').notNull(),
  url: text('url').notNull(),
  key: text('key').notNull(),
  type: text('type').notNull(),
  parent: bigint('parent', { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp('created_at', { mode: "date" }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: "date" }).defaultNow().onUpdateNow(),
}, (table) => {
  return [
    index("parent_index").on(table.parent),
    index("owner_index").on(table.ownerId),
  ]
});

export type FileSelectType = typeof fileSchema.$inferSelect;
export type FileInsertType = typeof fileSchema.$inferInsert;

export const folderSchema = createTable('folders', {
  id: bigint('id', { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  parent: bigint('parent', { mode: "number", unsigned: true }),
  createdAt: timestamp('created_at', { mode: "date" }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: "date" }).defaultNow().onUpdateNow(),
}, (table) => {
  return [
    index("parent_index").on(table.parent),
    index("owner_index").on(table.ownerId),
  ]
});

export type FolderSelectType = typeof folderSchema.$inferSelect;
export type FolderInsertType = typeof folderSchema.$inferInsert;