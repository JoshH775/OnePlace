import { db } from "../initDB";
import { Photo, photosTable, ProtoPhoto } from "../schema";

export default class PhotosRepository {

  async findById(id: number, userId: number): Promise<Photo | null> {
    const photo = await db.query.photosTable.findFirst({
      where: (photo, { and, eq }) => and(eq(photo.userId, userId), eq(photo.id, id)),
    })

    return photo ?? null;
  }

  async save(photos: ProtoPhoto[], userId: number): Promise<boolean> {
    try {
      const photosWithDates = photos.map(photo => ({
        ...photo,
        date: photo.date ? new Date(photo.date) : null,
        userId
      }))

      await db.insert(photosTable).values(photosWithDates)
    } catch (error) {
      console.error("Error saving photos:", error)
      return false
    }

    return true
  }
  

  async findAllForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
  })}

}

