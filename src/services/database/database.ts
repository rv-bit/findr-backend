import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'

if (!process.env.MYSQL_URL) {
	throw new Error('DATABASE_URL is required')
}

const db = drizzle({
	connection: {uri: process.env.MYSQL_URL},
})

export default db
