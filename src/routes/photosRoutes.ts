import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { storage } from "../firebase";
import { MultipartValue } from "@fastify/multipart";
import { uploadPhotoToGoogles } from "./googleRoutes";
import { Filters, Photo, ProtoPhoto, User } from "@shared/types";
import sharp from "sharp";
import { asyncHandler } from "..";
import { GoogleIntegrationRepository } from "@backend/database/repositories/GoogleIntegrationRepository";
import SettingsRepository from "@backend/database/repositories/SettingsRepository";

const Photos = new PhotosRepository();
const GoogleIntegrations = new GoogleIntegrationRepository();
const Settings = new SettingsRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {
  server.get(
    "/api/photos/:id",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id } = req.params as { id: string };
      const { thumbnail, download } = req.query as {
        thumbnail?: string;
        download?: string;
      };
      const photo = await Photos.getById(parseInt(id), userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
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
        expires: Date.now() + 15 * 60 * 1000,
      });

      return res.redirect(url);
    })
  );

  server.post(
    "/api/photos/upload",
    asyncHandler(async (req, res) => {
      const parts = req.parts();
      const { id: userId } = req.user as User;

      const files = [];

      for await (const part of parts) {
        if (part.type === "file") {
          const fileBuffer = await part.toBuffer();
          const metadataFieldName = `metadata_${part.fieldname.split("_")[1]}`;
          const metadata = part.fields[metadataFieldName];

          if (!metadata) {
            throw new Error(`Metadata field ${metadataFieldName} not found`);
          }

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
        return res.status(400).send({ error: "No files uploaded" });
      }

      await Photos.create(
        files.map((file) => file.metadata),
        userId
      );

      for (const { file: buffer, metadata } of files) {
        const path = `users/${userId}/${metadata.filename}`;
        const file = storage.bucket().file(path);
        await file.save(buffer);

        const thumbnailPath = `users/${userId}/thumbnails/${metadata.filename}`;
        const thumbnailFile = storage.bucket().file(thumbnailPath);
        await thumbnailFile.save(
          await sharp(buffer).resize(200, 200).webp().toBuffer()
        );
      }

      const sendToGoogle =
        (await Settings.getUserSetting("google_auto_upload", userId)) &&
        (await GoogleIntegrations.findByUserId(userId));
      if (sendToGoogle) {
        uploadPhotoToGoogles(userId, files);
      }

      return res.status(201).send();
    })
  );

  server.post(
    "/api/photos",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const filters = req.body as Filters | null;

      if (!filters) {
        const photos = await Photos.getAllForUser(userId);
        return res.send(photos);
      }

      const photos = await Photos.getWithFilters(filters, userId);
      return res.send(photos);
    })
  );

  server.put(
    "/api/photos",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { photo: newPhoto } = req.body as { photo: Photo };

      if (!newPhoto) throw new Error("Photo data is required");

      const photo = await Photos.getById(newPhoto.id, userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      await Photos.update(newPhoto, userId);

      return res.status(201);
    })
  );

  server.post(
    "/api/photos/bulk-delete",
    asyncHandler(async (req, res) => {
      const { ids } = req.body as { ids: number[] };
      const { id: userId } = req.user as User;

      const deletePromises = ids.map(async (id) => {
        const photo = await Photos.getById(id, userId);
        if (!photo) return null;
        await deletePhotoFromFirebase(photo, userId);
        await Photos.delete(id);
      });

      await Promise.all(deletePromises);
      return res.status(204).send();
    })
  );

  server.delete(
    "/api/photos/delete-all",
    asyncHandler(async (req, res) => {
      const { id } = req.user as User;
      await deleteUserPhotosFromFirebase(id);
      await Photos.deleteAllForUser(id);
      return res.status(204).send();
    })
  );

  server.delete(
    "/api/photos/:id",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id } = req.params as { id?: string };

      if (!id) {
        return res.status(400).send({ error: "Invalid request" });
      }

      const photo = await Photos.getById(parseInt(id), userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      await deletePhotoFromFirebase(photo, userId);
      await Photos.delete(parseInt(id));
      return res.status(204).send();
    })
  );

  server.put(
    "/api/photos/:id/last-accessed",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id } = req.params as { id: string };
      const photo = await Photos.getById(parseInt(id), userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      await Photos.setLastAccessed(photo.id, userId);
      return res.status(204).send();
    }
  ))

  //Tags

  server.get(
    "/api/photos/:id/tags",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id } = req.params as { id: string };
      const photo = await Photos.getById(parseInt(id), userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      const tags = await Photos.getTagsForPhoto(photo.id);
      return res.send(tags);
    })
  );

  server.post(
    "/api/photos/:id/tags",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id } = req.params as { id: string };
      const { tag } = req.body as { tag: { name: string; color?: string } };

      if (!tag) {
        return res.status(400).send({ error: "Tags are required" });
      }

      const photo = await Photos.getById(parseInt(id), userId);

      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      await Photos.addTagToPhoto(photo.id, tag, userId);

      const allTags = await Photos.getTagsForPhoto(photo.id);
      return res.send(allTags);
    })
  );

  server.delete(
    "/api/photos/:id/tags/:tagId",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User;
      const { id, tagId } = req.params as { id: string; tagId: string };

      if (!id || !tagId) {
        return res.status(400).send({ error: "Invalid request" });
      }

      const photo = await Photos.getById(parseInt(id), userId);
      if (!photo) {
        return res.status(404).send({ error: "Photo not found" });
      }

      await Photos.removeTagFromPhoto(photo.id, parseInt(tagId));

      const allTags = await Photos.getTagsForPhoto(photo.id);
      return res.send(allTags);
    })
  );
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

  const file = bucket.file(`${path}/${photo.filename}`);
  const thumbnail = bucket.file(`${thumbnailPath}/${photo.filename}`);

  await file.delete();
  await thumbnail.delete();
}
