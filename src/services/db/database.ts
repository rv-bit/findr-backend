import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import {createPool} from 'mysql2/promise'

const poolConnection = createPool({
	host: process.env.MYSQLHOST,
	user: process.env.MYSQLUSER,
	database: process.env.MYSQL_DATABASE,
	password: process.env.MYSQLPASSWORD,
	port: parseInt(process.env.MYSQLPORT || '3306'),
})

const db = drizzle({
	client: poolConnection,
})

export default db
