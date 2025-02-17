import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { User } from "../database/repositories/UserRepository";
import { storage } from "../firebase";
import { Photo } from "../database/schema";

const Photos = new PhotosRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {

    server.post("/api/photos/generate-signed-url", async (req, res) => {
        const { id: userId } = req.user as User;
        const { files } = req.body as { files: { filename: string, type: string }[] };
        const bucket = storage.bucket();

        const signedUrls = await Promise.all(files.map(async (file) => {
            const filePath = `users/${userId}/${file.filename}`;
            const [url] = await bucket.file(filePath).getSignedUrl({
                action: "write",
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                contentType: file.type
            })

            return { path: filePath, url };
        }));

        return signedUrls;
    })

    server.post("/api/photos/save", async (req, res) => {
        const { photos } = req.body as { photos: Photo[] };
        
        await Photos.save(photos);

        return { success: true };
    })

    server.post("/api/photos", async (req, res) => {
        //this is where filtering is supposed ot happen
        const { id: userId } = req.user as User;
        const photos = await Photos.findAllForUser(userId);
        return photos;

    });
}