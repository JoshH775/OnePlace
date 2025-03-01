CREATE TABLE `user_settings` (
	`userId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`type` varchar(255) NOT NULL,
	CONSTRAINT `user_settings_userId_key_pk` PRIMARY KEY(`userId`,`key`)
);
--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;