'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { FolderIcon, FileTextIcon, ImageIcon, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import type { FolderTreeNode } from "~/lib/types";


export function FolderTree(props: { folderTree: FolderTreeNode, currentFolderId: number }) {
  const { folderTree, currentFolderId } = props;

  console.log({
    folderTree,
    currentFolderId,
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return <ImageIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-blue-600" />;
    }
  };

  const renderFolder = (node: FolderTreeNode) => {
    const isCurrentFolder = node.folder.id === currentFolderId;

    const hasChindren = (node: FolderTreeNode) => {
      return node.children.files.length > 0 || node.children.folders.length > 0;
    }

    return (
      <Collapsible key={node.folder.id} defaultOpen={node.isInPath}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm font-medium",
            isCurrentFolder
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Link href={`/f/${node.folder.id}`} className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-blue-500" />
              {node.folder.name}
            </Link>
            {hasChindren(node) && <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180 cursor-pointer" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-2">
          {node.children.folders.map((childFolder) => renderFolder(childFolder))}

          {node.children.files.map((file) => (
            <Link
              key={file.id}
              href={file.url}
              className="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              {getFileIcon(file.type)}
              {file.name}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="ml-2 mt-1">
      {renderFolder(folderTree)}
    </div>
  );
}