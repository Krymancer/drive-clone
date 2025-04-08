import { eq } from "drizzle-orm";
import { db } from ".";
import { fileSchema, folderSchema } from "./schema";

export async function getAllParentsForFolder(folderId: number) {
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
}

export async function getFolders(parentId: number) {
  return db.select().from(folderSchema).where(eq(folderSchema.parent, parentId));
}

export async function getFiles(parentId: number) {
  return db.select().from(fileSchema).where(eq(fileSchema.parent, parentId));
}


