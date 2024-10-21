import * as dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: "/.env" });

export default defineConfig({
    out: './drizzle',
    schema: './schema',
    dialect: 'mysql',

    dbCredentials: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
    },
});