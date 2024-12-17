import 'dotenv/config'
import { Request } from 'express'

import { betterAuth } from 'better-auth'
import { fromNodeHeaders } from 'better-auth/node'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import * as schema from '../models/index.js'
import db from '../services/database.js'

const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'mysql',
		schema: schema,
	}),

	trustedOrigins: trustedOrigins || ['http://localhost:3000'],

	emailAndPassword: {
		enabled: true,
	},

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			redirectURI: process.env.NODE_ENV === 'development' ? process.env.BASE_URL + '/api/auth/callback/github/' : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + '/api/auth/callback/github/',
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
})

export const userMiddleware = async (request: Request) => {
	const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })

	if (!session) {
		return {
			user: null,
			session: null,
		}
	}

	return {
		user: session.user,
		session: session.session,
	}
}
