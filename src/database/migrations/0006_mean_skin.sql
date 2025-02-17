ALTER TABLE `photos` ADD `type` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `width` int NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `height` int NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `location` text;--> statement-breakpoint
ALTER TABLE `photos` ADD `date` timestamp;