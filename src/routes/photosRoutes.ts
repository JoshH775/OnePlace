import { FastifyInstance } from "fastify";
import PhotosRepository from "../database/repositories/PhotosRepository";
import { User } from "../database/repositories/UserRepository";
import { storage } from "../firebase";
import { Photo } from "../database/schema";
import sharp from "sharp";

const Photos = new PhotosRepository();

export default function registerPhotosRoutes(server: FastifyInstance) {

    server.get("/api/photos/:id", async (req, res) => {
        const { id: userId } = req.user as User;
        const { id } = req.params as { id: string };
        const photo = await Photos.findById(parseInt(id), userId);

        if (!photo) {
            res.status(404);
            return { error: "Photo not found" };
        }

        const path = `users/${userId}/${photo.filename}`;

        const file = storage.bucket().file(path);
        // const [url] = await file.getSignedUrl({
        //     action: "read",
        //     expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        //     version: "v4"
        // })

        // return res.redirect(url);
        const [buffer] = await file.download();
        const lightweightFormats = ['jpeg', 'png', 'webp', 'jpg'];
        const fileType = photo.filename.split('.').pop()?.toLowerCase();

        // if (!fileType || !lightweightFormats.includes(fileType)) {
        //     const webpBuffer = await sharp(buffer).jpeg({ quality: 80}).toBuffer();
        //     res.header('Content-Type', 'image/jpeg');
        //     return res.send(webpBuffer);
        // }

        res.header('Content-Type', `image/${fileType}`);

        return buffer;
    })

    server.post("/api/photos/generate-signed-url", async (req, res) => {
        const { id: userId } = req.user as User;
        const { files } = req.body as { files: { filename: string, type: string }[] };
        const bucket = storage.bucket();

        const signedUrls = await Promise.all(files.map(async (file) => {
            const filePath = `users/${userId}/${file.filename}`;
            const [url] = await bucket.file(filePath).getSignedUrl({
                action: "write",
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                version: "v4"
            })

            return { path: filePath, url };
        }));

        return signedUrls;
    })

    server.post("/api/photos/save", async (req, res) => {
        const { photos } = req.body as { photos: Photo[] };
        const success = await Photos.save(photos, (req.user as User).id);

        return { success };
    })

    server.post("/api/photos", async (req, res) => {
        //this is where filtering is supposed ot happen
        const { id: userId } = req.user as User;
        const photos = await Photos.findAllForUser(userId);
        return photos;

    });

    //temp
    server.get("/api/photos/delete-all", async (req, res) => {
        await Photos.deleteAllPhotos();
        return { success: true };
    });
}