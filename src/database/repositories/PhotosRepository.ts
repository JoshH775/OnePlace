import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "../initDB";
import { collectionPhotosTable, photosTable } from "../schema";
import { Filters, Photo, ProtoPhoto, UpdatablePhotoProperties } from "@shared/types";
import { MySqlSelect } from "drizzle-orm/mysql-core";

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

  async findWithFilters(filters: Filters, userId: number): Promise<Photo[]> {

    let query = db.select({
      id: photosTable.id,
      userId: photosTable.userId,
      filename: photosTable.filename,
      size: photosTable.size,
      alias: photosTable.alias,
      type: photosTable.type,
      location: photosTable.location,
      date: photosTable.date,
      googleId: photosTable.googleId,
      createdAt: photosTable.createdAt,
      lastAccessed: photosTable.lastAccessed,
      compressed: photosTable.compressed,
    }).from(photosTable).where(eq(photosTable.userId, userId)).$dynamic()

    function withFilters<T extends MySqlSelect>(qb: T, filters: Filters) {
      const { collectionId, dateRange, uploadDateRange } = filters

      if (collectionId) {
       qb.leftJoin(collectionPhotosTable, eq(collectionPhotosTable.photoId, photosTable.id)).where(eq(collectionPhotosTable.collectionId, collectionId))
      }

      if (dateRange) {
        qb.where(and(gt(photosTable.date, dateRange.min), lt(photosTable.date, dateRange.max)))
      }

      if (uploadDateRange) {
        qb.where(and(gt(photosTable.createdAt, uploadDateRange.min), lt(photosTable.createdAt, uploadDateRange.max)))
      }

      return qb
    }

    query = withFilters(query, filters)
    
    return await query.execute()
  }

  async deletePhotoById(id: number) {
    await db.delete(photosTable).where(eq(photosTable.id, id));
  }
}
