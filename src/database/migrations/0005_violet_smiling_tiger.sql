ALTER TABLE `photos` MODIFY COLUMN `filename` text NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` MODIFY COLUMN `size` int NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `compressed` int DEFAULT 0 NOT NULL;