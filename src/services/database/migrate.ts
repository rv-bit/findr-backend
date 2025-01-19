import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle(process.env.MYSQL_URL);

await migrate(db, {
    migrationsFolder: "./src/services/database/migrations",
});