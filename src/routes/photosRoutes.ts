import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { storage } from "../firebase";
import { MultipartValue } from "@fastify/multipart";
import { uploadPhotoToGoogle } from "./googleRoutes";
import { Photo, ProtoPhoto, User } from "@shared/types";
import sharp from "sharp";
import { request } from "http";

const Photos = new PhotosRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {
  server.get("/api/photos/:id", async (req, res) => {
    const { id: userId } = req.user as User;
    const { id } = req.params as { id: string };
    const { thumbnail, download } = req.query as {
      thumbnail?: string;
      download?: string;
    };
    const photo = await Photos.findById(parseInt(id), userId);

    if (!photo) {
      res.status(404);
      return { error: "Photo not found" };
    }

    const path =
      thumbnail === "true"
        ? `users/${userId}/thumbnails/${photo.filename}`
        : `users/${userId}/${photo.filename}`;
    const file = storage.bucket().file(path);

    if (download === "true") {
      const [buffer] = await file.download();
      return res.send(buffer);
    }

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return res.redirect(url);
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

    if (files.length === 0) {
      res.status(400);
      return res.send({ error: "No files uploaded" });
    }

    await Photos.create(
      files.map((file) => file.metadata),
      userId
    );

    //Upload to Firebase Storage
    for (const { file: buffer, metadata } of files) {
      try {
        //Upload full size image
        const path = `users/${userId}/${metadata.filename}`;
        const file = storage.bucket().file(path);
        await file.save(buffer);

        //Upload thumbnail
        const thumbnailPath = `users/${userId}/thumbnails/${metadata.filename}`;
        const thumbnailFile = storage.bucket().file(thumbnailPath);
        await thumbnailFile.save(
          await sharp(buffer).resize(200, 200).webp().toBuffer()
        );
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

  server.put("/api/photos", async (req, res) => {
    const { id: userId } = req.user as User;
    const { photo: newPhoto } = req.body as { photo: Photo }

    if (!newPhoto) return res.status(400)

    const photo = await Photos.findById(newPhoto.id, userId)
    if (!photo) return res.status(404)
    
    await Photos.update(newPhoto, userId)

    res.status(201)
    return { success: true }


  })

  server.post('/api/photos/bulk-delete', async (req, res) => {
    const { ids } = req.body as { ids: number[] }
    const { id:userId } = req.user as User

    const deletePromises = ids.map(async (id) => {
      const photo = await Photos.findById(id, userId)
      if (!photo) return null
      await deletePhotoFromFirebase(photo, userId)
      await Photos.deletePhotoById(id)
    })

    await Promise.all(deletePromises)
    res.send({ success: true });
  })

  server.delete("/api/photos/delete-all", async (req, res) => {
    const { id } = req.user as User;
    await deleteUserPhotosFromFirebase(id);
    await Photos.deleteAllForUser(id); //delete from my db
    res.send({ success: true });
  });
  

  server.delete("/api/photos/:id", async (req, res) => {
    const { id: userId } = req.user as User;
    const { id } = req.params as { id?: string };

    if (!id) {
      return res.status(400);
    }

    const photo = await Photos.findById(parseInt(id), userId);

    if (!photo) {
      return res.status(404);
    }

    deletePhotoFromFirebase(photo, userId);
    await Photos.deletePhotoById(parseInt(id));
    return { success: true };
  });
}

async function deleteUserPhotosFromFirebase(userId: number) {
  const path = `users/${userId}`;
  const bucket = storage.bucket();
  const [files] = await bucket.getFiles({
    prefix: path,
    maxResults: 500,
    autoPaginate: true,
  });

  const deletePromises = files.map((file) => file.delete());
  await Promise.all(deletePromises);
}

async function deletePhotoFromFirebase(photo: Photo, userId: number) {
  const path = `users/${userId}`;
  const thumbnailPath = `users/${userId}/thumbnails`;
  const bucket = storage.bucket();

  const file = await bucket.file(`${path}/${photo.filename}`);
  const thumbnail = await bucket.file(`${thumbnailPath}/${photo.filename}`);

  file.delete();
  thumbnail.delete();
}
