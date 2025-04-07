import { int, text, singlestoreTableCreator } from 'drizzle-orm/singlestore-core';

export const createTable = singlestoreTableCreator(
  (name) => `drive_tutorial_${name}`,
);

export const users = createTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: text('name'),
  age: int('age'),
});