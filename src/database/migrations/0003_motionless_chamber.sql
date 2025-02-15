ALTER TABLE `photos` MODIFY COLUMN `filename` text;--> statement-breakpoint
ALTER TABLE `photos` MODIFY COLUMN `size` int;--> statement-breakpoint
ALTER TABLE `photos` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `lastAccessed` timestamp DEFAULT (now()) NOT NULL;