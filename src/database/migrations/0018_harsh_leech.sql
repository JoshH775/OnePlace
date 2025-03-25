CREATE TABLE `photo_tags` (
	`photoId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `photo_tags_photoId_tagId_pk` PRIMARY KEY(`photoId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`color` varchar(255),
	`name` varchar(255) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `photo_tags` ADD CONSTRAINT `photo_tags_photoId_photos_id_fk` FOREIGN KEY (`photoId`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `photo_tags` ADD CONSTRAINT `photo_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `tags` ADD CONSTRAINT `tags_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;