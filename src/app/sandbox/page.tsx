import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { mockFolders } from "~/lib/mock-data";
import { db } from "~/server/db";
import { folderSchema } from "~/server/db/schema";

export default async function Sandbox() {
  const user = await auth();
  if (!user.userId) {
    throw new Error("User not found");
  }

  const folders = await db
    .select()
    .from(folderSchema)
    .where(eq(folderSchema.ownerId, user.userId));

  console.log(folders);

  return (
    <div>
      <form
        action={async () => {
          "use server";
          const user = await auth();
          if (!user.userId) {
            throw new Error("User not found");
          }

          const [rootFolder] = await db
            .insert(folderSchema)
            .values({
              name: "root",
              ownerId: user.userId,
              parent: null,
            })
            .$returningId();

          const insertableFolders = mockFolders.map((folder) => ({
            name: folder.name,
            ownerId: user.userId,
            parent: rootFolder!.id,
          }));
          await db.insert(folderSchema).values(insertableFolders);
        }}
      >
        <button type="submit">Seed database</button>
      </form>
    </div>
  );
}