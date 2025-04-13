import type { FolderSelectType, FileSelectType } from "~/server/db/schema";

export type FolderTreeNode = {
    folder: FolderSelectType;
    children: {
      files: FileSelectType[];
      folders: FolderTreeNode[];
    };
    isInPath?: boolean;
  };
  