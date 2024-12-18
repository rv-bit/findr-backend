import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	out: './drizzle',
	schema: './dist/models/index.js',
	dialect: 'mysql',

	dbCredentials: {
		url: process.env.MYSQL_URL!,
	},

	verbose: true,
	strict: true,
} as Config)
