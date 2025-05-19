CREATE TABLE `comments_downvotes` (
	`id` varchar(36) NOT NULL,
	`commentId` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `comments_downvotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments_upvotes` (
	`id` varchar(36) NOT NULL,
	`commentId` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `comments_upvotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comments_downvotes` ADD CONSTRAINT `comments_downvotes_commentId_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments_downvotes` ADD CONSTRAINT `comments_downvotes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments_upvotes` ADD CONSTRAINT `comments_upvotes_commentId_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments_upvotes` ADD CONSTRAINT `comments_upvotes_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;