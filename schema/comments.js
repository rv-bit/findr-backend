import * as t from "drizzle-orm/mysql-core";
import { mysqlTable as table } from "drizzle-orm/mysql-core";

import posts from "./posts";
import users from "./users";

const comments = table("comments", {
    id: t.int().primaryKey().autoincrement(),
    postId: t.int("post_id").references(() => posts.id),
    text: t.varchar({ length: 256 }),
    ownerId: t.int("owner_id").references(() => users.id),
});

export default comments;