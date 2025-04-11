import { FileIcon, Folder as FolderIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import type { fileSchema, folderSchema } from "~/server/db/schema"

import { deleteFile } from "~/server/actions"
import { Button } from "~/components/ui/button"

export function FileRow(props: { file: typeof fileSchema.$inferSelect }) {
  const { file } = props

  function formatFileSize(bytes: number): string {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const base = 1024;
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));

    // Format with 2 decimal places and remove trailing zeros
    return `${parseFloat((bytes / Math.pow(base, unitIndex)).toFixed(2))} ${units[unitIndex]}`;
  }

  return (
    <li key={file.id} className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6 flex items-center">
          <a
            href={file.url}
            target="_blank"
            className="flex items-center text-gray-100 hover:text-blue-400"
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </a>
        </div>
        <div className="col-span-2 text-gray-400">{file.type}</div>
        <div className="col-span-3 text-gray-400">{formatFileSize(file.size)}</div>
        <div className="col-span-1 text-gray-400">
          <Button
            variant="ghost"
            onClick={() => deleteFile(file.id)}
            aria-label="Delete file"
          >
            <Trash2Icon size={20}></Trash2Icon>
          </Button>
        </div>
      </div>
    </li>
  )
}

export function FolderRow(props: { folder: typeof folderSchema.$inferSelect }) {
  const { folder } = props
  return (
    <li key={folder.id} className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex items-center text-gray-100 hover:text-blue-400"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-3 text-gray-400"></div>
        <div className="col-span-3 text-gray-400"></div>
      </div>
    </li>
  )
}