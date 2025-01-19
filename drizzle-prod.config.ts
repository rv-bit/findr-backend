import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	out: './build/services/database/migrations',
	schema: './build/services/database/schema.js',

	dbCredentials: {
		url: process.env.MYSQL_URL,
	},

	verbose: true,
	strict: true,
} as Config)
