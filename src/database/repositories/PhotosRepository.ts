import { db } from "../initDB";
import { photosTable } from "../schema";

export default class PhotosRepository {

  async getAllPhotosForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
    });
  }

  async uploadPhotoFromUrl(userId: number, url: string): Promise<number> {
    const result = await db.insert(photosTable).values({
      userId,
      url,
    });

    return result[0].insertId;
  }
}

export type Photo = {
  id: number;
  userId: number;
  filename: string | null;
  size: number | null;
  alias: string | null;
  url: string;
  googleId: string | null;
};
