import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	out: './src/services/database/migrations',
	schema: './src/services/database/schema.ts',
	dialect: 'mysql',

	dbCredentials: {
		url: process.env.MYSQL_URL,
	},

	verbose: true,
	strict: true,
} as Config)
