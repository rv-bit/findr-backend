import { mysqlTable as table, varchar, int, uniqueIndex, index } from "drizzle-orm/mysql-core";

import { generateUniqueString } from "./utils/index.js";
import { user } from "./auth.js";

export const posts = table(
    "posts",
    {
        id: int().primaryKey().autoincrement(),
        slug: varchar({ length: 256 }).$default(() => generateUniqueString(16)),
        title: varchar({ length: 256 }),
        userId: varchar("userId", { length: 256 }).references(() => user.id),
    },
    (table) => {
        return {
            slugIndex: uniqueIndex("slug_idx").on(table.slug),
            titleIndex: index("title_idx").on(table.title),
        };
    }
);