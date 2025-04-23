ALTER TABLE `messages` RENAME COLUMN `sentAt` TO `created_at`;--> statement-breakpoint
ALTER TABLE `comments` ADD `created_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD `updated_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `updated_at` timestamp NOT NULL;