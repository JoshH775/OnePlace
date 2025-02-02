CREATE TABLE `google_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`googleId` varchar(255) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `google_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `google_integrations` ADD CONSTRAINT `google_integrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;