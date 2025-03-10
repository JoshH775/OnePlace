import CollectionsRepository from "@backend/database/repositories/CollectionsRepository";
import { FastifyInstance } from "fastify";

const Collections = new CollectionsRepository();

export function registerCollectionRoutes(server: FastifyInstance) {

    server.post("/api/collections", async (req, res) => {
        const { name, description } = req.body as { name: string, description: string };
        const { id: userId } = req.user as { id: number };

        const collection = await Collections.create({
            name,
            description,
            userId,
        });

        return collection;
    })

    server.get("/api/collections", async (req, res) => {
        const { id: userId } = req.user as { id: number };
        const { query } = req.query as { query?: string };

        const collections = await Collections.getCollectionsForUser(userId, query);

        return collections;
    })
}