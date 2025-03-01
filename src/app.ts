import 'dotenv/config'
import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

import { cors } from 'hono/cors'

// import helmet from 'helmet'
// import cors from 'cors'
// import path from 'path'

// import { toNodeHandler } from 'better-auth/node'
import { auth } from '~/utils/index'

// import routes from '~/routes/index'
// import * as middlewares from './middlewares'

const app = new Hono<{
	// types for any body context of session or user
	Variables: {
		user: typeof auth.$Infer.Session.user | null
		session: typeof auth.$Infer.Session.session | null
	}
}>()

const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

console.log('Trusted Origins:', trustedOrigins)

const corsOptions = {
	origin: trustedOrigins || '',
	credentials: true, // This ensures that cookies/credentials are allowed
	allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'], // Ensure necessary headers are allowed
	exposeHeaders: ['Content-Length'],
}

// app.set('trust proxy', 1) // Trust first proxy
// app.use(cors(corsOptions))
// app.use(helmet())
// app.use(limiter) // Apply rate limiting for all routes

// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'docker') {
// 	const __dirname = path.resolve()
// 	app.use(express.static(path.join(__dirname, '../dist')))
// }

// app.all('/auth/*', toNodeHandler(auth))

// app.use(express.json())
// app.use('/v0/', routes)

// app.use(middlewares.notFoundHandler)
// app.use(middlewares.errorHandler)

app.use(cors(corsOptions))
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: 20, // limit each IP to 100 requests per windowMs
		standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
		keyGenerator: (c) => 'limiter',
	})
)

app.on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw))
app.get('/', (c) => c.text('Hello Bun!'))

export default app
