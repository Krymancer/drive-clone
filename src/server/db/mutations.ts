import "server-only";

import { db } from ".";
import { fileSchema, folderSchema, type FileInsertType } from "./schema";

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
  