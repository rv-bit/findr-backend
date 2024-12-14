import 'dotenv/config'
import express from 'express'

import cors from 'cors'
import path from 'path'

import { toNodeHandler, fromNodeHeaders } from 'better-auth/node' // Better Auth handler
import { auth, limiter } from './utils/index.js' // Your auth config
import routes from './routes/index.js' // Your other routes

const app = express()
const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

const corsOptions = {
	origin: trustedOrigins,
	credentials: true, // This ensures that cookies/credentials are allowed
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'], // Ensure necessary headers are allowed
}

app.set('trust proxy', 1) // Trust first proxy
app.use(cors(corsOptions))
app.use(limiter) // Apply rate limiting for all routes

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'docker') {
	const __dirname = path.resolve()
	app.use(express.static(path.join(__dirname, '../dist')))
}

app.all('/api/auth/*', toNodeHandler(auth))

app.use(express.json())
app.use('/api/v1', routes)

app.use((req, res, next) => {
	res.status(404).send('Not Found')
	next()
})

export default app
