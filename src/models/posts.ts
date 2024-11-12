import * as t from "drizzle-orm/mysql-core";
import { mysqlTable as table } from "drizzle-orm/mysql-core";

import { generateUniqueString } from "./utils/index.js";
import { user } from "./auth.js";

export const posts = table(
    "posts",
    {
        id: t.int().primaryKey().autoincrement(),
        slug: t.varchar({ length: 256 }).$default(() => generateUniqueString(16)),
        title: t.varchar({ length: 256 }),
        userId: t.varchar("userId", { length: 256 }).references(() => user.id),
    },
    (table) => {
        return {
            slugIndex: t.uniqueIndex("slug_idx").on(table.slug),
            titleIndex: t.index("title_idx").on(table.title),
        };
    }
);