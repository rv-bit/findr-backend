import * as t from "drizzle-orm/mysql-core";
import { mysqlTable as table } from "drizzle-orm/mysql-core";

import { user } from "./auth.js";
import { posts } from "./posts.js";

export const comments = table("comments", {
    id: t.int().primaryKey().autoincrement(),
    postId: t.int("post_id").references(() => posts.id),
    text: t.varchar({ length: 256 }),
    userId: t.varchar("userId", { length: 256 }).references(() => user.id),
});
