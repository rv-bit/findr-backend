ALTER TABLE `comments` DROP FOREIGN KEY `comments_post_id_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;