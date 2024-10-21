import * as t from "drizzle-orm/mysql-core";
import { mysqlTable as table } from "drizzle-orm/mysql-core";

const users = table(
    "users",
    {
        id: t.int().primaryKey().autoincrement(),
        firstName: t.varchar("first_name", { length: 256 }),
        lastName: t.varchar("last_name", { length: 256 }),
        email: t.varchar({ length: 256 }).notNull(),
        invitee: t.int().references(() => users.id),
        role: t.mysqlEnum(["guest", "user", "admin"]).default("guest"),
    },
    (table) => {
        return {
            emailIndex: t.uniqueIndex("email_idx").on(table.email),
        };
    }
);

export default users;