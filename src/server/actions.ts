"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { fileSchema, folderSchema, type FolderInsertType } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utApi = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();

  if (!session.userId) return { error: "Unauthorized" };

  const [file] = await db.select().from(fileSchema).where(and(eq(fileSchema.id, fileId), eq(fileSchema.ownerId, session.userId)));

  if (!file) return { error: "File not found" };

  const result = await utApi.deleteFiles([file.key]);

  if (result.deletedCount === 0) return { error: "Failed to delete file" };

  await db.delete(fileSchema).where(eq(fileSchema.id, fileId));

  const c = await cookies();

  c.set("force-refresh", `${Math.random()}`);

  return { success: true };
}

export async function deleteFolder(folderId: number) {
  const session = await auth();

  if (!session.userId) return { error: "Unauthorized" };

  const [folder] = await db
    .select()
    .from(folderSchema)
    .where(and(eq(folderSchema.id, folderId), eq(folderSchema.ownerId, session.userId)));

  if (!folder) return { error: "Folder not found" };
  if (folder.parent === null) return { error: "Cannot delete root folder" };

  await deleteFolderContents(folderId, session.userId);
  await db.delete(folderSchema).where(eq(folderSchema.id, folderId));

  const c = await cookies();
  c.set("force-refresh", `${Math.random()}`);

  return { success: true };
}

async function deleteFolderContents(folderId: number, userId: string) {
  const files = await db.select().from(fileSchema).where(
    and(
      eq(fileSchema.parent, folderId),
      eq(fileSchema.ownerId, userId)
    )
  );

  const folders = await db.select().from(folderSchema).where(
    and(
      eq(folderSchema.parent, folderId),
      eq(folderSchema.ownerId, userId)
    )
  );

  const fileKeys = files.map(file => file.key).filter(Boolean);
  if (fileKeys.length > 0) {
    const result = await utApi.deleteFiles(fileKeys);
    if (result.deletedCount === 0) return { error: "Failed to delete file" };
  }

  for (const file of files) {
    await db.delete(fileSchema).where(eq(fileSchema.id, file.id));
  }

  for (const subfolder of folders) {
    await deleteFolderContents(subfolder.id, userId);
    await db.delete(folderSchema).where(eq(folderSchema.id, subfolder.id));
  }
}

export default async function createFolder(folder: FolderInsertType) {
  const session = await auth();

  if (!session.userId) return { error: "Unauthorized" };

  const [createdFolder] = await db.insert(folderSchema).values(folder).$returningId();

  if (!createdFolder) return { error: "Failed to create folder" };

  const c = await cookies();
  c.set("force-refresh", `${Math.random()}`);

  return { success: true };
}