ALTER TABLE `google_integrations` MODIFY COLUMN `refreshToken` text NOT NULL;--> statement-breakpoint
ALTER TABLE `google_integrations` ADD `email` text NOT NULL;