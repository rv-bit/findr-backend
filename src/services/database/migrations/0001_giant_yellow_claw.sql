CREATE TABLE `downvotes` (
	`id` varchar(36) NOT NULL,
	`postId` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `downvotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
RENAME TABLE `likes` TO `upvotes`;--> statement-breakpoint
ALTER TABLE `upvotes` DROP FOREIGN KEY `likes_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `upvotes` DROP FOREIGN KEY `likes_user_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `upvotes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `upvotes` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `downvotes` ADD CONSTRAINT `downvotes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downvotes` ADD CONSTRAINT `downvotes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `upvotes` ADD CONSTRAINT `upvotes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `upvotes` ADD CONSTRAINT `upvotes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;