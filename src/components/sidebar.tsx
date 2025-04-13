"use client";

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Label } from "./ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { useState } from "react";
import { UploadButton } from "./uploadthing";
import { useRouter } from "next/navigation"
import createFolder from "~/server/actions";
import { FolderTree } from "./folder-tree";
import { Clock, FolderIcon, HardDrive, Plus, Star } from "lucide-react";
import type { FolderTreeNode } from "~/lib/types";

export function Sidebar(props: { currentFolderId: number, folderTree: FolderTreeNode }) {
  const navigate = useRouter();
  const [folderName, setFolderName] = useState("")  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2 rounded-full" size="lg">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new</DialogTitle>
              <DialogDescription>Upload a file or create a new folder in the current directory.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="upload" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload file</TabsTrigger>
                <TabsTrigger value="folder">New folder</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">                    
                    <UploadButton
                      endpoint="fileUploader"
                      input={{
                        folderId: props.currentFolderId,
                      }}
                      onClientUploadComplete={() => {
                        setIsDialogOpen(false);
                        navigate.refresh();
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="folder" className="py-4">
                <form action={async() => {
                  await createFolder({
                    name: folderName,
                    parent: props.currentFolderId,
                    ownerId: '',                    
                  });
                  setIsDialogOpen(false);
                }} >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="folder-name">Folder name</Label>
                    <Input
                      id="folder-name"
                      placeholder="Enter folder name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={!folderName.trim()} className="gap-2">
                    <FolderIcon className="h-4 w-4" />
                    Create folder
                  </Button>
                </DialogFooter>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      <nav className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium bg-accent text-accent-foreground"
          >
            <HardDrive className="h-4 w-4" />
            My Drive
          </Link>

            <FolderTree 
            folderTree={props.folderTree} 
            currentFolderId={props.currentFolderId} 
          />
        
          <Link
            href="#"
            className="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
          >
            <Clock className="h-4 w-4" />
            Recent
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
          >
            <Star className="h-4 w-4" />
            Starred
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Storage</span>
            <span>15.5 GB of 30 GB used</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
