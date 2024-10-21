import * as t from "drizzle-orm/mysql-core";
import { mysqlTable as table } from "drizzle-orm/mysql-core";

import { generateUniqueString } from "../utils";

import users from "./users";

const posts = table(
    "posts",
    {
        id: t.int().primaryKey().autoincrement(),
        slug: t.varchar({ length: 256 }).$default(() => generateUniqueString(16)),
        title: t.varchar({ length: 256 }),
        ownerId: t.int("owner_id").references(() => users.id),
    },
    (table) => {
        return {
            slugIndex: t.uniqueIndex("slug_idx").on(table.slug),
            titleIndex: t.index("title_idx").on(table.title),
        };
    }
);

export default posts;