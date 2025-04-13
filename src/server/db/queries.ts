import "server-only";

import { eq, and, isNull } from "drizzle-orm";
import { db } from ".";
import { fileSchema, folderSchema } from "./schema";
import type { FolderTreeNode } from "~/lib/types";

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
    return db.select().from(folderSchema).where(eq(folderSchema.parent, parentId)).orderBy(folderSchema.name);
  },
  getFiles: async function (parentId: number) {
    return db.select().from(fileSchema).where(eq(fileSchema.parent, parentId)).orderBy(fileSchema.name);
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
  },
  getFolderTreeData: async function (folderId: number): Promise<FolderTreeNode> {
    const [folder] = await db.select().from(folderSchema).where(eq(folderSchema.id, folderId));

    if (!folder) throw new Error("Folder not found");

    const folderFiles = await db.select().from(fileSchema).where(eq(fileSchema.parent, folderId));

    const childFolders = await db.select().from(folderSchema).where(eq(folderSchema.parent, folderId));

    const childrenData = await Promise.all(
      childFolders.map(async (childFolder) => {
        return QUERIES.getFolderTreeData(childFolder.id);
      })
    );

    return {
      folder,
      children: {
        files: folderFiles,
        folders: childrenData,
      },
    };
  },
  getFolderTreeDataFromRoot: async function (currentFolderId: number): Promise<FolderTreeNode> {
    const pathToRoot = new Set<number>();

    let [currentFolder] = await db.select().from(folderSchema).where(eq(folderSchema.id, currentFolderId));

    while (currentFolder) {
      pathToRoot.add(currentFolder.id);
      if (!currentFolder.parent) break;
      [currentFolder] = await db.select().from(folderSchema).where(eq(folderSchema.id, currentFolder.parent));
    }

    // Helper function to build tree recursively
    async function buildTree(parentId: number | null): Promise<FolderTreeNode[]> {
      // Get all folders with this parent
      const foldersList = await db.select().from(folderSchema).where(parentId === null
        ? isNull(folderSchema.parent)
        : eq(folderSchema.parent, parentId)).orderBy(folderSchema.name);

      // Build tree for each folder
      const folderNodes = await Promise.all(
        foldersList.map(async (folder) => {
          // Get files only if this folder is the current folder
          const folderFiles = folder.id === currentFolderId
            ? await db.select().from(fileSchema).where(eq(fileSchema.parent, folder.id)).orderBy(fileSchema.name)
            : [];

          // Recursively get children
          const childFolders = await buildTree(folder.id);

          return {
            folder,
            children: {
              files: folderFiles,
              folders: childFolders,
            },
            isInPath: pathToRoot.has(folder.id)
          };
        })
      );

      return folderNodes;
    }
    
    const [treeNode] = await buildTree(null);

    if (!treeNode) {
      throw new Error("No folders found");
    }

    return treeNode;
  }
};