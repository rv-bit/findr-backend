import { mysqlTable as table, varchar, int, timestamp, text, boolean } from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import { user } from "./auth.js";

export const directMessages = table("messages", {
    id: int("id").primaryKey().autoincrement(),
    senderId: varchar("senderId", { length: 255 }).notNull().references(() => user.id),
    receiverId: varchar("receiverId", { length: 255 }).notNull().references(() => user.id),
    messageText: text("messageText").notNull(),
    sentAt: timestamp("sentAt").notNull(),
    isRead: boolean("isRead").default(false)
});

type Messages = InferSelectModel<typeof directMessages>
type InsertMessages = InferInsertModel<typeof directMessages>

export type { Messages, InsertMessages };