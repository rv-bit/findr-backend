import 'dotenv/config';
import { defineConfig, Config } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './dist/models/index.js',
    dialect: 'mysql',

    dbCredentials: {
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        database: process.env.DATABASE_NAME!,
        password: process.env.DATABASE_PASSWORD!,
    },

    verbose: true,
    strict: true,
} as Config);
