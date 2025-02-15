import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { User } from "../database/repositories/UserRepository";

const Photos = new PhotosRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {
    server.post("/api/photos", async (request, reply) => {
        const user = request.user as User
        const photos = await Photos.getAllPhotosForUser(user.id);
        return photos;
    });

    server.post("/api/photos/upload-url", async (request, reply) => {
        const user = request.user as User
        const { url } = request.body as { url: string }
        const id = await Photos.uploadPhotoFromUrl(user.id, url);
        return { id };
    });
}