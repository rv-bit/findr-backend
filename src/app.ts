import 'dotenv/config'
import express from 'express'

import helmet from "helmet";
import cors from 'cors';
import path from 'path';

import { toNodeHandler } from "better-auth/node";
import { auth, limiter } from "./utils/index.js";

import routes from './routes/index.js';
import * as middlewares from './middlewares.js';

const app = express()
const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

console.log('Trusted Origins:', trustedOrigins)

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

app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

export default app
