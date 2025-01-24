import 'dotenv/config'
import { Request } from 'express'

import { betterAuth } from "better-auth";
import { fromNodeHeaders } from 'better-auth/node';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, twoFactor, username } from "better-auth/plugins"

import * as schema from "#services/database/schema.js"
import db from "#services/database/database.js";

import { sendEmail } from '#services/email.js';

const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

export const auth = betterAuth({
    name: "Findr",
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: schema
    }),

	baseURL: process.env.NODE_ENV === 'development' ? process.env.BASE_URL : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`),
	trustedOrigins: trustedOrigins || ['http://localhost:3000'],

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({user, url, token}, request) => {
			const urlObj = new URL(url);
			const callbackURL = urlObj.searchParams.get('callbackURL');
			const newUrl = (process.env.NODE_ENV === 'development' ? process.env.BASE_URL : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`)) + callbackURL! + '?token=' + token;

			await sendEmail({
				to: user.email,	
				subject: "Reset your password",
				text: `Click the link to reset your password: ${newUrl}`,
			});
		},
	},

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			redirectURI: process.env.NODE_ENV === 'development' ? process.env.BASE_URL + '/api/auth/callback/github/' : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + '/api/auth/callback/github/',
		},
	},

    session: {
        expiresIn: 60 * 60 * 24 * 2, // 2 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)

		cookieCache: { // Cache the session cookie for 5 minutes
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    },

	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path === '/reset-password/') { // example of a custom hook
				return;
			}
		}),
        after: createAuthMiddleware(async (ctx) => {
			if (ctx.path === '/reset-password/') { // example of a custom hook
				return;
			}
		}),
	},

    plugins: [
        twoFactor(),
        username()
    ]
});

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
