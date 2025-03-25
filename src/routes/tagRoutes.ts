import TagsRepository from "@backend/database/repositories/TagsRepository";
import { User } from "@shared/types";
import { FastifyInstance } from "fastify";
import { asyncHandler } from "..";

const Tags = new TagsRepository()

export default function registerTagRoutes(server: FastifyInstance) {

    server.get('/api/tags', asyncHandler(async (req, res) => {
        const { id: userId } = req.user as User
        const tags = await Tags.getTagsForUser(userId)
        return res.send(tags)
    }))

    server.post('/api/tags', asyncHandler(async (req, res) => {
        const { id: userId } = req.user as User
        const { name, color } = req.body as { name: string, color?: string }
        const tag = await Tags.getByName(userId, name)

        if (tag) {
            return res.status(400).send({ error: "Tag already exists" })
        }

        const id = await Tags.create(userId, { name, color })
        return res.send({ id })
    }))

    server.delete('/api/tags/:id', asyncHandler(async (req, res) => {
        const { id: userId } = req.user as User
        const { id } = req.params as { id: string }

        if (!id) {
            return res.status(400).send({ error: "Invalid request" })
        }

        const tag = await Tags.getById(userId, parseInt(id))

        if (!tag) {
            return res.status(404).send({ error: "Tag not found" })
        }

        await Tags.delete(tag.id)
        return res.status(204).send()
    }))

   
    
}