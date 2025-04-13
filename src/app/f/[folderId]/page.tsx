import { FileGrid } from "~/components/file-grid"
import { Header } from "~/components/header"
import { Sidebar } from "~/components/sidebar"
import { QUERIES } from "~/server/db/queries";

export default async function DrivePage(props: { params: Promise<{ folderId: string }> }) {
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);

  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  const [folders, files, parents, folderTree] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
    QUERIES.getFolderTreeDataFromRoot(parsedFolderId)
  ]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentFolderId={parsedFolderId} folderTree={folderTree} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header parents={parents} />
        <main className="flex-1 overflow-auto p-4">
          <FileGrid folders={folders} files={files} currentFolderId={parsedFolderId} />
        </main>
      </div>
    </div>
  )
}
