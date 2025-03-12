ALTER TABLE `collection_photos` DROP FOREIGN KEY `collection_photos_photoId_photos_id_fk`;
--> statement-breakpoint
ALTER TABLE `collections` DROP FOREIGN KEY `collections_coverPhotoId_photos_id_fk`;
--> statement-breakpoint
ALTER TABLE `collection_photos` ADD CONSTRAINT `collection_photos_photoId_photos_id_fk` FOREIGN KEY (`photoId`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collections` ADD CONSTRAINT `collections_coverPhotoId_photos_id_fk` FOREIGN KEY (`coverPhotoId`) REFERENCES `photos`(`id`) ON DELETE set null ON UPDATE no action;