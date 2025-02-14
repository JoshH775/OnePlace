import { db } from "../initDB";
import { photosTable } from "../schema";

export default class PhotosRepository {

  async getAllPhotosForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
    });
  }

  async uploadPhotos(){}

}

export interface Photo {
  id: number;
  userId: number;
  url: string;
  filename: string;
  size: number;
  alias: string | null;
  googleId: string | null;
  createdAt: Date;
  lastAccessed: Date;
  compressed: number;
}