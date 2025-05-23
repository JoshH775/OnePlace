import { and, eq, gt, inArray, isNotNull, like, lt } from "drizzle-orm";
import { db } from "../initDB";
import { collectionPhotosTable, photosTable, photoTagsTable, tagsTable } from "../schema";
import { Filters, Photo, ProtoPhoto, Tag, UpdatablePhotoProperties } from "@shared/types";
import { MySqlSelect } from "drizzle-orm/mysql-core";
import TagRepository from "./TagsRepository";
import moment from "moment";
import { TimestampFormat } from "@shared/constants";

const Tags = new TagRepository()

export default class PhotosRepository {
  async getById(id: number, userId: number): Promise<Photo | null> {
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
      location: photo.location,
    };

    await db
      .update(photosTable)
      .set(photoValues)
      .where(and(eq(photosTable.id, photo.id), eq(photosTable.userId, userId)))

      await db.select().from(photosTable).where(eq(photosTable.id, photo.id)) 

  }

  async delete(id: number) {
    await db.delete(photosTable).where(eq(photosTable.id, id));
  }

  async deleteAllForUser(userId: number) {
    await db.delete(photosTable).where(eq(photosTable.userId, userId));
  }

  async getAllForUser(userId: number): Promise<Photo[]> {
    return await db.query.photosTable.findMany({
      where: (photos, { eq }) => eq(photos.userId, userId),
    });
  }

  async getWithFilters(filters: Filters, userId: number): Promise<Photo[]> {

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
      console.log("Filters: ", filters)
      const { collectionIds, dateRange, uploadDateRange, name, tags } = filters

      
      if (collectionIds && collectionIds.length > 0) {
        qb.innerJoin(collectionPhotosTable, eq(collectionPhotosTable.photoId, photosTable.id)).where(
          and(
            eq(photosTable.userId, userId),
            inArray(collectionPhotosTable.collectionId, collectionIds)
          )

        )
      }

      if (name) {
        qb.where(like(photosTable.filename, `%${name}%`))
      }

      if (tags && tags.length > 0) {
        qb.innerJoin(tagsTable, inArray(tagsTable.id, tags.map((tag) => tag.id))).innerJoin(photoTagsTable, eq(photoTagsTable.tagId, tagsTable.id)).where(
            eq(photoTagsTable.photoId, photosTable.id)
        )
      }

      if (dateRange && (dateRange.min || dateRange.max)) {
        const dateConditions = [];

        if (dateRange.min) {
          const minDate = moment(dateRange.min, "YYYY-MM-DD")
            .startOf("day")
            .format(TimestampFormat);
          dateConditions.push(gt(photosTable.date, minDate));
        }

        if (dateRange.max) {
          const maxDate = moment(dateRange.max, "YYYY-MM-DD")
            .endOf("day")
            .format(TimestampFormat);
          dateConditions.push(lt(photosTable.date, maxDate));
        }

        dateConditions.push(isNotNull(photosTable.date));
        qb.where(and(...dateConditions));
      }

      if (uploadDateRange && (uploadDateRange.min || uploadDateRange.max)) {
        const uploadConditions = [];

        if (uploadDateRange.min) {
          const minDate = moment(uploadDateRange.min, "YYYY-MM-DD")
            .startOf("day")
            .format(TimestampFormat);
          uploadConditions.push(gt(photosTable.createdAt, minDate));
        }

        if (uploadDateRange.max) {
          const maxDate = moment(uploadDateRange.max, "YYYY-MM-DD")
            .endOf("day")
            .format(TimestampFormat);
          uploadConditions.push(lt(photosTable.createdAt, maxDate));
        }

        uploadConditions.push(isNotNull(photosTable.createdAt));

        qb.where(and(...uploadConditions));
      }

      return qb
    }

    query = withFilters(query, filters)
    
    return await query.execute()
  }



  async getTagsForPhoto(photoId: number): Promise<Tag[]> {
    const tags = await db.select({ id: tagsTable.id, userId: tagsTable.userId, name: tagsTable.name, color: tagsTable.color })
      .from(tagsTable)
      .leftJoin(photoTagsTable, eq(photoTagsTable.tagId, tagsTable.id))
      .where(eq(photoTagsTable.photoId, photoId))

      return tags
  }

  async addTagToPhoto(photoId: number, tagData: { name: string, color?: string }, userId: number): Promise<Tag> {
    const existingTag = await Tags.getByName(userId, tagData.name)

    if (!existingTag) {
      const newTag = await Tags.create(userId, tagData)
      await db.insert(photoTagsTable).values({ photoId, tagId: newTag }).execute()

      return { id: newTag, name: tagData.name, color: tagData.color || null }
    }

    await db.insert(photoTagsTable).values({ photoId, tagId: existingTag.id })
    return existingTag
  }

  async removeTagFromPhoto(photoId: number, tagId: number) {
    await db.delete(photoTagsTable).where(and(eq(photoTagsTable.photoId, photoId), eq(photoTagsTable.tagId, tagId)))
}

  
}
