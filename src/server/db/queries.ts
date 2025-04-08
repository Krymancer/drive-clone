import "server-only";

import { eq } from "drizzle-orm";
import { db } from ".";
import { fileSchema, folderSchema } from "./schema";

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
    return db.select().from(folderSchema).where(eq(folderSchema.parent, parentId));
  },
  getFiles: async function (parentId: number) {
    return db.select().from(fileSchema).where(eq(fileSchema.parent, parentId));
  }
};

