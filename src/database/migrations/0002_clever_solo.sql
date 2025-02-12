CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`url` text NOT NULL,
	`filename` text NOT NULL,
	`size` int NOT NULL,
	`alias` varchar(255),
	`googleId` varchar(255),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`),
	CONSTRAINT `photos_googleId_unique` UNIQUE(`googleId`)
);
--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;