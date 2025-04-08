import { int, text, singlestoreTableCreator, index, bigint } from 'drizzle-orm/singlestore-core';

export const createTable = singlestoreTableCreator(
  (name) => `drive_tutorial_${name}`,
);

export const files = createTable('files', {
  id: bigint('id', { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: text('name').notNull(),
  size: int('size').notNull(),
  url: text('url').notNull(),
  parent: bigint('parent', { mode: "number", unsigned: true }).notNull(),
}, (table) => {
  return [
    index("parent_index").on(table.parent),
  ]
});

export const folders = createTable('folders', {
  id: bigint('id', { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: text('name').notNull(),
  parent: bigint('parent', { mode: "number", unsigned: true }),
}, (table) => {
  return [
    index("parent_index").on(table.parent),
  ]
});