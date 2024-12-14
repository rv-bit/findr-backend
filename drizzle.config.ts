import 'dotenv/config'
import { defineConfig, Config } from 'drizzle-kit'

export default defineConfig({
	out: './drizzle',
	schema: './dist/models/index.js',
	dialect: 'mysql',

	dbCredentials: {
		host: process.env.MYSQLHOST!,
		user: process.env.MYSQLUSER!,
		password: process.env.MYSQLPASSWORD!,
		database: process.env.MYSQLDATABASE!,
		port: parseInt(process.env.MYSQLPORT || '3306'),
	},

	verbose: true,
	strict: true,
} as Config)
