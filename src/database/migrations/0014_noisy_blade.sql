CREATE TABLE `collection_photos` (
	`collectionId` int NOT NULL,
	`photoId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastAccessed` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `collection_photos` ADD CONSTRAINT `collection_photos_collectionId_collections_id_fk` FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_photos` ADD CONSTRAINT `collection_photos_photoId_photos_id_fk` FOREIGN KEY (`photoId`) REFERENCES `photos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collections` ADD CONSTRAINT `collections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;