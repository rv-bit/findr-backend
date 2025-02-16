import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	out: './src/services/database/migrations',
	schema: './src/services/database/schema.ts',

	dbCredentials: {
		url: process.env.MYSQL_URL_STAGING,
	},

	verbose: true,
	strict: true,
} as Config)
