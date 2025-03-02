import 'dotenv/config'
import { Hono, type Context } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

import { cors } from 'hono/cors'

// import helmet from 'helmet'
// import cors from 'cors'
// import path from 'path'

// import { toNodeHandler } from 'better-auth/node'
import { auth } from '~/utils/index'
import logger from './utils/logger'

import * as schema from '~/services/database/schema'
import db from './services/database/database'

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
// app.use(
// 	rateLimiter({
// 		windowMs: 15 * 60 * 1000, // 15 minutes
// 		limit: 20, // limit each IP to 100 requests per windowMs
// 		standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
// 		keyGenerator: (c) => 'limiter',
// 	})
// )

app.on(['POST', 'GET'], '/auth/**', (c: Context) => auth.handler(c.req.raw))
app.get('/', (c: Context) => c.text('Hello Bun!'))
app.get('/v0/post/read', async (c: Context) => {
	const posts = await db.select().from(schema.posts).limit(5000)

	const allPosts = posts.map((post) => {
		return {
			slug: post.slug,
			title: post.title,
			content: post.content,
			userId: post.userId,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
		}
	})

	return c.json(allPosts)
})
app.get('/v0/post/write', async (c: Context) => {
	const length = await db.$count(schema.posts)
	for (let i = length + 1; i < length + 1000; i++) {
		const post = await db.insert(schema.posts).values({
			slug: 'test-post' + i,
			title: 'Test Post' + i,
			content: 'This is a test post' + i,
			userId: 'o3P6NXURD4LwOiwEF8xryx4S9bXj4Jin',

			createdAt: new Date(), // Use the current date as the createdAt value
			updatedAt: new Date(), // Use the current date as the updatedAt value
		})

		if (!post) {
			logger.error('Failed to create post', { post })

			return c.json(
				{
					message: 'Failed to create post',
				},
				200
			)
		}

		// for each new entry just return success
		return c.json(
			{
				message: 'Success',
			},
			200
		)
	}
})

export default app
