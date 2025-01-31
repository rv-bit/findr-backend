ALTER TABLE `user` ADD `normalized_email` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_normalized_email_unique` UNIQUE(`normalized_email`);