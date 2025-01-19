import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	dialect: 'mysql',
	out: './app/build/services/database/migrations',
	schema: './app/build/services/database/schema.js',

	dbCredentials: {
		url: process.env.MYSQL_URL,
	},

	verbose: true,
	strict: true,
} as Config)
