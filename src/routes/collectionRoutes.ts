import CollectionsRepository from "@backend/database/repositories/CollectionsRepository"
import { User } from "@shared/types"
import { FastifyInstance } from "fastify"
import { asyncHandler } from ".."
import PhotosRepository from "@backend/database/repositories/PhotosRepository"

const Collections = new CollectionsRepository()
const Photos = new PhotosRepository()

export function registerCollectionRoutes(server: FastifyInstance) {
  server.post(
    "/api/collections",
    asyncHandler(async (req, res) => {
      const { name, description } = req.body as { name: string; description: string }
      const { id: userId } = req.user as User

      if (!name || name.length === 0) {
        res.status(400)
        return { success: false, message: "Name is required" }
      }

      const collection = await Collections.create({
        name,
        description,
        userId,
      })

      res.status(201)
      return collection
    })
  )

  server.get(
    "/api/collections",
    asyncHandler(async (req, res) => {
      const { id: userId } = req.user as User
      const { query } = req.query as { query?: string }

      const collections = await Collections.getCollectionsForUser(userId, query)

      return collections
    })
  )

  server.get(
    "/api/collections/:collectionId",
    asyncHandler(async (req, res) => {
      const { collectionId } = req.params as { collectionId: string }
      const { id: userId } = req.user as User

      const collection = await Collections.getById(parseInt(collectionId), userId)

      if (!collection) {
        res.status(404)
        return { error: "Collection not found" }
      }

      return collection
    })
  )

  server.delete(
    "/api/collections/:collectionId",
    asyncHandler(async (req, res) => {
      const { collectionId } = req.params as { collectionId: string }
      const { id: userId } = req.user as User

      if (!collectionId) {
        res.status(400)
        return { success: false, message: "Invalid request" }
      }

      const collection = await Collections.getById(parseInt(collectionId), userId)

      if (!collection) {
        res.status(404)
        return { error: "Collection not found" }
      }

      await Collections.delete(parseInt(collectionId))
      return res.status(204).send()
    })
  )

  server.put(
    "/api/collections/:collectionId/photos",
    asyncHandler(async (req, res) => {
      const { collectionId } = req.params as { collectionId: string }
      const { photoIds } = req.body as { photoIds: number[] }
      const { id: userId } = req.user as User

      const collection = await Collections.getById(parseInt(collectionId), userId)

      if (!collection) {
        res.status(404)
        return { success: false, message: "Collection not found" }
      }

      if (!collectionId || !photoIds || photoIds.length === 0) {
        res.status(400)
        return { success: false, message: "Invalid request" }
      }

      if (!collection.coverPhotoId && photoIds.length > 0) {
        await Collections.update({
          ...collection,
          coverPhotoId: photoIds[0],
        })
      }

      await Collections.addPhotosToCollection(parseInt(collectionId), photoIds)

      return { success: true }
    })
  )

  server.get(
    "/api/collections/:collectionId/photos", asyncHandler(async (req, res) => {
    const { collectionId } = req.params as { collectionId?: string }
    const { id: userId } = req.user as User

    if (!collectionId) {
      res.status(400)
      return { error: "Collection ID is required" }
    }

    const collection = await Collections.getById(parseInt(collectionId), userId)

    if (!collection) {
      res.status(404)
      return { error: "Collection not found" }
    }

    const photos = await Photos.findWithFilters({ collectionId: parseInt(collectionId) }, userId)
    return photos
  
  })
)}
