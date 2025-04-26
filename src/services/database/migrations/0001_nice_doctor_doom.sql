ALTER TABLE `downvotes` DROP FOREIGN KEY `downvotes_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `shares` DROP FOREIGN KEY `shares_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `upvotes` DROP FOREIGN KEY `upvotes_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `downvotes` ADD CONSTRAINT `downvotes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_relatedUserId_user_id_fk` FOREIGN KEY (`relatedUserId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shares` ADD CONSTRAINT `shares_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `upvotes` ADD CONSTRAINT `upvotes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;