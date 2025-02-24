CREATE TABLE `global_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`type` varchar(255) NOT NULL,
	CONSTRAINT `global_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`type` varchar(255) NOT NULL,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `photos` MODIFY COLUMN `compressed` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` MODIFY COLUMN `compressed` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;