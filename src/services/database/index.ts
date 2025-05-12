import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import { createPool } from 'mysql2'

const pool = createPool({
	host: process.env.MYSQLHOST,
	user: process.env.MYSQLUSER,
	password: process.env.MYSQLPASSWORD,
	database: process.env.MYSQL_DATABASE,
})

const db = drizzle({
	logger: process.env.NODE_ENV === 'development' ? true : false,
	client: pool,
})

export default db
