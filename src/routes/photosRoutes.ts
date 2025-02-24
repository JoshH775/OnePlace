import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { User } from "../database/repositories/UserRepository";
import { storage } from "../firebase";
import { ProtoPhoto } from "../database/schema";
import { MultipartValue } from "@fastify/multipart";
import { uploadPhotoToGoogle } from "./googleRoutes";

const Photos = new PhotosRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {
  server.get("/api/photos/:id", async (req, res) => {
    const { id: userId } = req.user as User;
    const { id } = req.params as { id: string };
    const photo = await Photos.findById(parseInt(id), userId);

    if (!photo) {
      res.status(404);
      return { error: "Photo not found" };
    }

    const path = `users/${userId}/${photo.filename}`;

    const file = storage.bucket().file(path);
    const [buffer] = await file.download();
    const fileType = photo.filename.split(".").pop()?.toLowerCase();

    res.header("Content-Type", `image/${fileType}`);

    return buffer;
  });

  server.post("/api/photos/upload", async (req, res) => {
    const parts = req.parts();
    const { id: userId } = req.user as User;

    const files = [];

    for await (const part of parts) {
      if (part.type === "file") {
        const fileBuffer = await part.toBuffer();

        const metadataFieldName = `metadata_${part.fieldname.split("_")[1]}`;
        const metadata = part.fields[metadataFieldName];

        if (!metadata) {
          res.status(400);
          return res.send({
            error: `Metadata field ${metadataFieldName} not found`,
          });
        }

        //Lots of casting, but necessary as fields retrieved from part.fields are typed as an unkown MultipartValue
        const metadataObject: ProtoPhoto = JSON.parse(
          (metadata as MultipartValue).value as string
        );

        files.push({
          file: fileBuffer,
          metadata: metadataObject,
        });
      }
    }

    console.log("Received files:", files);

    if (files.length === 0) {
      res.status(400);
      return res.send({ error: "No files uploaded" });
    }

    await Photos.create(
      files.map((file) => file.metadata),
      userId
    );

    for (const { file: buffer, metadata } of files) {
      try {
        const path = `users/${userId}/${metadata.filename}`;
        const file = storage.bucket().file(path);
        await file.save(buffer);
      } catch (error) {
        console.error(`Error saving file: ${metadata.filename}: `, error);
        res.status(500);
        return res.send({ error: "Failed to save file" });
      }
    }

    //Upload to Google Photos
    await uploadPhotoToGoogle(userId, files);

    return res.send({ success: true });
  });

  server.post("/api/photos", async (req, res) => {
    //this is where filtering is supposed ot happen
    const { id: userId } = req.user as User;
    const photos = await Photos.findAllForUser(userId);
    return photos;
  });

  //temp
  server.get("/api/photos/delete-all", async (req, res) => {
    await Photos.deleteAllPhotos();
    return { success: true };
  });
}
