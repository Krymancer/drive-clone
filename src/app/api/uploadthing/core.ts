import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    blob: {
      maxFileSize: "1GB",
      maxFileCount: 25,
    },
  }).input(z.object({
    folderId: z.number()
  }))
    .middleware(async ({ input }) => {
      const user = await auth();

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user.userId) throw new UploadThingError("Unauthorized");

      const folder = await QUERIES.getFolderById(input.folderId);
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!folder) throw new UploadThingError("Folder not found");
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (folder.ownerId !== user.userId) throw new UploadThingError("Unauthorized");

      return { userId: user.userId, parentId: input.folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      await MUTATIONS.createFile({
        file: {
          ownerId: metadata.userId,
          name: file.name,
          size: file.size,
          url: file.ufsUrl,
          key: file.key,
          type: file.type,
          parent: metadata.parentId,
        },
        userId: metadata.userId,
      })

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
