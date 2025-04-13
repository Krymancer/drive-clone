"use client";

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { FileIcon, FileTextIcon, FolderIcon, ImageIcon, MoreVertical, Share2, Star } from "lucide-react"
import type { fileSchema, FileSelectType, folderSchema, FolderSelectType } from "~/server/db/schema"
import Link from "next/link"
import { deleteFile, deleteFolder } from "~/server/actions"

export function FileGrid(props: {
  files: typeof fileSchema.$inferSelect[],
  folders: typeof folderSchema.$inferSelect[],
  currentFolderId: number,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center py-2 px-3 text-sm font-medium text-muted-foreground border-b">
        <div className="flex items-center gap-2 w-5/12">Name</div>        
        <div className="w-2/12">Last modified</div>
        <div className="w-1/12">Size</div>
        <div className="w-2/12">Actions</div>
      </div>
      <div className="divide-y">
        {props.folders.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
        {props.files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  )
}

async function FileItem(props: { file: FileSelectType | FolderSelectType }) {

  const itemType = (props.file as FileSelectType).type ?? "folder";
  const isFolder = itemType === "folder";

  const itemFolder = props.file as FolderSelectType;
  const itemFile = props.file as FileSelectType;

  const getFileIcon = (type: string) => {
    const [parsedType] = type.split("/")

    const icons = {
      "folder": <FolderIcon className="h-5 w-5 text-blue-500" />,
      "document": <FileTextIcon className="h-5 w-5 text-blue-600" />,
      "spreadsheet": <FileIcon className="h-5 w-5 text-green-600" />,
      "image": <ImageIcon className="h-5 w-5 text-purple-600" />,
    };

    return icons[parsedType as keyof typeof icons] ?? icons["document" as keyof typeof icons];
  }

  return (
    <Link
      href={isFolder ? `/f/${props.file.id}` : itemFile.url}
      key={props.file.id}
      className="flex items-center py-2 px-3 hover:bg-accent/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-2 w-5/12">
        <div className="flex-shrink-0">{getFileIcon(itemType)}</div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate" title={props.file.name}>
            {props.file.name}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ml-1 ${false ? "text-yellow-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"
            }`}
        >
          <Star className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-2/12 text-sm text-muted-foreground truncate">{props.file.updatedAt?.toDateString()}</div>
      <div className="w-1/12 text-sm text-muted-foreground truncate">{itemFile.size ?? "—"}</div>
      <div className="w-2/12 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">            
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={async(e) => {
              e.preventDefault();
              await (isFolder ? deleteFolder(itemFolder.id) : deleteFile(itemFile.id));
            }} >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}