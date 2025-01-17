import { mysqlTable as table, varchar, int, timestamp, boolean } from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import { user } from "./auth.js";
import { posts } from "./posts.js";

export const notifications = table("notifications", {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("userId", { length: 255 }).notNull().references(() => user.id),
    type: varchar("type", { length: 50 }).notNull(),  // E.g., 'like', 'comment', 'follow'
    relatedUserId: varchar("relatedUserId", { length: 255 }),  // The user who triggered the notification
    postId: int("postId").references(() => posts.id),  // If the notification is related to a post
    createdAt: timestamp("createdAt").notNull(),
    isRead: boolean("isRead").default(false)
});

type Notifications = InferSelectModel<typeof notifications>
type InsertNotifications = InferInsertModel<typeof notifications>

export type { Notifications, InsertNotifications };