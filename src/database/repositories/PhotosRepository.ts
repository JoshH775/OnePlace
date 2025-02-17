import { db } from "../initDB";
import { Photo, photosTable } from "../schema";

export default class PhotosRepository {

  async getAllPhotosForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
    });
  }

  async save(photos: Photo[]) {
     await db.insert(photosTable).values(photos)
  }

  async findAllForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
  })}

}

