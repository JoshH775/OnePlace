import { and, eq } from "drizzle-orm";
import { db } from "../initDB";
import { photosTable } from "../schema";
import { Photo, ProtoPhoto, UpdatablePhotoProperties } from "@shared/types";

export default class PhotosRepository {
  async findById(id: number, userId: number): Promise<Photo | null> {
    const photo = await db.query.photosTable.findFirst({
      where: (photo, { and, eq }) =>
        and(eq(photo.userId, userId), eq(photo.id, id)),
    });

    return photo ?? null;
  }

  async create(photos: ProtoPhoto[], userId: number): Promise<Photo[] | null> {
    try {
      

      const photosWithUserId = photos.map(photo => ({ ...photo, userId }));
      const results = await db
        .insert(photosTable)
        .values(photosWithUserId)
        .$returningId();
      const photoIds = results.map((result) => result.id);

      const returnedPhotos: Photo[] = await db.query.photosTable.findMany({
        where: (photos, { or, eq }) =>
          or(...photoIds.map((id) => eq(photos.id, id))),
      });

      return returnedPhotos;
    } catch (error) {
      console.error("Error saving photos:", error);
      return null;
    }
  }

  async update(photo: Photo, userId: number) {
    
    const photoValues: UpdatablePhotoProperties = {
      date: photo.date,
      filename: photo.filename,
      location: photo.location,
    };


    console.log(photo)

    console.log(photoValues)

    await db
      .update(photosTable)
      .set(photoValues)
      .where(and(eq(photosTable.id, photo.id), eq(photosTable.userId, userId)))

      await db.select().from(photosTable).where(eq(photosTable.id, photo.id)) 


  }

  async deleteAllForUser(userId: number) {
    await db.delete(photosTable).where(eq(photosTable.userId, userId));
  }

  async findAllForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
    });
  }

  async deletePhotoById(id: number) {
    await db.delete(photosTable).where(eq(photosTable.id, id));
  }
}
