import { mysqlTable as table, varchar, timestamp } from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import { user } from "./auth.js";

export const followers = table("followers", {
    followerId: varchar("followerId", { length: 255 }).notNull().references(() => user.id),
    followingId: varchar("followingId", { length: 255 }).notNull().references(() => user.id),
    followedAt: timestamp("followedAt").notNull(),
}, (table) => {
    return {
        primaryKey: ["followerId", "followingId"]  // Define composite primary key here
    };
});

type Followers = InferSelectModel<typeof followers>
type InsertFollowers = InferInsertModel<typeof followers>

export type { Followers, InsertFollowers };