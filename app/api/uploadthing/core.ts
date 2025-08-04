import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await getServerSession(authOptions);

      // If you throw, the user will not be able to upload
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("[UploadThing] Image upload complete for userId:", metadata.userId);
      console.log("[UploadThing] Image file url:", file.url);
      console.log("[UploadThing] Image file details:", { name: file.name, size: file.size, key: file.key });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      console.log("[UploadThing] Returning to client:", { ...file, uploadedBy: metadata.userId });
      return { ...file, uploadedBy: metadata.userId };
    }),

  videoUploader: f({ video: { maxFileSize: "128MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Video upload complete for userId:", metadata.userId);
      console.log("[UploadThing] Video file url:", file.url);
      console.log("[UploadThing] Returning to client:", { ...file, uploadedBy: metadata.userId });
      return { ...file, uploadedBy: metadata.userId };
    }),

  // Avatar uploader with image restrictions
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      // You can update the user's avatar URL in the database here if needed
      // await updateUserAvatar(metadata.userId, file.url);
      
      console.log("[UploadThing] Returning to client:", { ...file, uploadedBy: metadata.userId });
      return { ...file, uploadedBy: metadata.userId };
    }),

  // General file uploader for documents, etc.
  fileUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
    audio: { maxFileSize: "16MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "16MB", maxFileCount: 5 }
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("[UploadThing] Returning to client:", { ...file, uploadedBy: metadata.userId });
      return { ...file, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
