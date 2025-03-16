ALTER TABLE `collection_photos` DROP FOREIGN KEY `collection_photos_collectionId_collections_id_fk`;
--> statement-breakpoint
ALTER TABLE `collection_photos` DROP FOREIGN KEY `collection_photos_photoId_photos_id_fk`;
--> statement-breakpoint
ALTER TABLE `collection_photos` ADD CONSTRAINT `collection_photos_collectionId_collections_id_fk` FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `collection_photos` ADD CONSTRAINT `collection_photos_photoId_photos_id_fk` FOREIGN KEY (`photoId`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE cascade;