import { mysqlTable as table, varchar, int } from "drizzle-orm/mysql-core";

import { user } from "./auth.js";
import { posts } from "./posts.js";

export const comments = table("comments", {
    id: int().primaryKey().autoincrement(),
    postId: int("post_id").references(() => posts.id),
    text: varchar({ length: 256 }),
    userId: varchar("userId", { length: 256 }).references(() => user.id),
});
