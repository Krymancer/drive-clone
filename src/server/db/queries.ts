import "server-only";

import { eq, and, isNull } from "drizzle-orm";
import { db } from ".";
import { fileSchema, folderSchema, type FileInsertType } from "./schema";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;

    while (currentId !== null) {
      const [folder] = await db.select().from(folderSchema).where(eq(folderSchema.id, currentId));

      if (!folder) {
        throw new Error(`Folder with ID ${currentId} not found`);
      }

      parents.unshift(folder);
      currentId = folder.parent;
    }

    return parents;
  },
  getFolders: async function (parentId: number) {
    return db.select().from(folderSchema).where(eq(folderSchema.parent, parentId)).orderBy(folderSchema.createdAt);
  },
  getFiles: async function (parentId: number) {
    return db.select().from(fileSchema).where(eq(fileSchema.parent, parentId)).orderBy(fileSchema.createdAt);
  },
  getFolderById: async function (folderId: number) {
    const [folder] = await db.select().from(folderSchema).where(eq(folderSchema.id, folderId));
    return folder;
  },
  getRootFolderForUser: async function (userId: string) {
    const [folder] = await db
      .select()
      .from(folderSchema)
      .where(
        and(
          eq(folderSchema.ownerId, userId),
          isNull(folderSchema.parent)
        )
      );
    return folder;
  }
};

export const MUTATIONS = {
  createFile: async function (input: { file: FileInsertType, userId: string }) {
    return await db.insert(fileSchema).values(input.file);
  },
  onboardUser: async function (userId: string) {
    const [rootFolder] = await db
      .insert(folderSchema)
      .values({
        name: "Root",
        parent: null,
        ownerId: userId,
      })
      .$returningId();

    const rootFolderId = rootFolder!.id;

    await db.insert(folderSchema).values([
      {
        name: "Trash",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Shared",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
      },
    ]);

    return rootFolderId;
  },
}
