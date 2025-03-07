import { eq } from "drizzle-orm";
import { db } from "../initDB";
import { photosTable } from "../schema";
import { Photo, ProtoPhoto } from "@shared/types";

export default class PhotosRepository {

  async findById(id: number, userId: number): Promise<Photo | null> {
    const photo = await db.query.photosTable.findFirst({
      where: (photo, { and, eq }) => and(eq(photo.userId, userId), eq(photo.id, id)),
    })

    return photo ?? null;
  }

  async create(photos: ProtoPhoto[], userId: number): Promise<Photo[] | null> {
    try {
      const photosWithDates = photos.map(photo => ({
        ...photo,
        date: photo.date ? new Date(photo.date) : null,
        userId
      }))

      const results = await db.insert(photosTable).values(photosWithDates).$returningId()
      const photoIds = results.map(result => result.id)
      
      const returnedPhotos: Photo[] = await db.query.photosTable.findMany({
        where: (photos, { or, eq }) => or(...photoIds.map(id => eq(photos.id, id))),
      })

      return returnedPhotos

    } catch (error) {
      console.error("Error saving photos:", error)
      return null
    }
  }
  
  async deleteAllForUser(userId: number) {
    await db.delete(photosTable).where(eq(photosTable.userId, userId))
  }

  async findAllForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
  })}

  async deleteAllPhotos() {
    await db.delete(photosTable)
  }
}

