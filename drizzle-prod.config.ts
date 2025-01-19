import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	out: './dist/services/database/migrations',
	schema: './dist/services/database/schema.js',

	dbCredentials: {
		url: process.env.MYSQL_URL,
	},

	verbose: true,
	strict: true,
} as Config)
