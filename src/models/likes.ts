import { mysqlTable as table, varchar, int, timestamp } from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import { user } from "./auth.js";
import { posts } from "./posts.js";

export const likes = table("likes", {
    id: int("id").primaryKey().autoincrement(),
    postId: int("postId").notNull().references(() => posts.id),
    userId: varchar("userId", { length: 255 }).notNull().references(() => user.id),
    createdAt: timestamp("createdAt").notNull()
});

type Likes = InferSelectModel<typeof likes>
type InsertLikes = InferInsertModel<typeof likes>

export type { Likes, InsertLikes };