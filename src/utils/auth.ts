import 'dotenv/config'
import { Request } from 'express'

import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { fromNodeHeaders } from 'better-auth/node'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware, emailOTP, twoFactor, username } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

import config from '../config.js'

import * as schema from '#services/database/schema.js'
import db from '#services/database/database.js'

import { sendEmail } from '#services/email.js'

const trustedOrigins = process.env.BETTER_TRUSTED_ORIGINS?.split(',').map((origin) => {
	return origin.startsWith('http') ? origin : `https://${origin}`
})

// This function is used to create a unique username if the username already exists
const createUniqueUsername = (username: string) => {
	let uniqueUsername = username

	;(async () => {
		const user = await db.select().from(schema.user).where(eq(schema.user.username, username))
		let uniqueUser = user[0] // since username is unique, there should be only one user with this username

		if (uniqueUser) {
			let i = 0
			while (uniqueUser) {
				i += 1
				uniqueUsername = username + i

				const user = await db.select().from(schema.user).where(eq(schema.user.username, uniqueUsername))
				uniqueUser = user[0]
			}
		}
	})()

	return uniqueUsername
}

export const auth = betterAuth({
	name: config.APP_NAME,
	database: drizzleAdapter(db, {
		provider: 'mysql',
		schema: schema,
	}),

	baseURL: process.env.NODE_ENV === 'development' ? process.env.BASE_URL : process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
	trustedOrigins: trustedOrigins || ['http://localhost:3000'],

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			redirectURI: process.env.NODE_ENV === 'development' ? process.env.BASE_URL + '/api/auth/callback/github/' : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + '/api/auth/callback/github/',
			scope: ['user:email', 'read:user'],
			mapProfileToUser(profile) {
				return {
					name: profile.name,
					email: profile.email,
					image: profile.avatar_url,
					username: createUniqueUsername(profile.login),
				}
			},
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			redirectURI: process.env.NODE_ENV === 'development' ? process.env.BASE_URL + '/api/auth/callback/google/' : (process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + '/api/auth/callback/google/',
			scope: ['email', 'profile'],
			mapProfileToUser(profile) {
				return {
					name: profile.given_name,
					email: profile.email,
					image: profile.picture,
					username: createUniqueUsername(profile.given_name + profile.family_name),
				}
			},
		},
	},

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			const urlObj = new URL(url)
			const callbackURL = urlObj.searchParams.get('callbackURL')
			const newUrl = (process.env.NODE_ENV === 'development' ? process.env.BASE_URL : process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + callbackURL! + '?token=' + token

			await sendEmail({
				to: user.email,
				subject: 'Reset your password',
				text: `Click the link to reset your password: ${newUrl}`,
			})
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			const urlObj = new URL(url)
			const callbackURL = urlObj.searchParams.get('callbackURL')
			const newUrl = (process.env.NODE_ENV === 'development' ? process.env.BASE_URL : process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + callbackURL! + '?token=' + token

			await sendEmail({
				to: user.email,
				subject: 'Verify your email address',
				text: `Click the link to verify your email: ${newUrl}`,
			})
		},
	},

	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['google', 'github'],
		},
	},

	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
				const urlObj = new URL(url)
				const callbackURL = urlObj.searchParams.get('callbackURL')
				const newUrl = (process.env.NODE_ENV === 'development' ? process.env.BASE_URL : process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + callbackURL! + '?token=' + token

				await sendEmail({
					to: user.email, // verification email must be sent to the current user email to approve the change
					subject: 'Approve email change',
					text: `Click the link to approve the change: ${newUrl}`,
				})
			},
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }, request) => {
				const urlObj = new URL(url)
				const callbackURL = urlObj.searchParams.get('callbackURL')
				const newUrl = (process.env.NODE_ENV === 'development' ? process.env.BASE_URL : process.env.RAILWAY_PUBLIC_DOMAIN?.startsWith('http') ? process.env.RAILWAY_PUBLIC_DOMAIN : `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) + callbackURL! + '?token=' + token

				await sendEmail({
					to: user.email,
					subject: 'Delete your account',
					text: `Click the link to delete your account: ${newUrl}`,
				})
			},
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 2, // 2 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
		freshAge: 0, // 60 * 60 * 24 = 1 day (if the session is older than 1 day, it's considered not fresh)

		cookieCache: {
			// Cache the session cookie for 5 minutes
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},

	advanced: {
		crossSubDomainCookies: {
			enabled: false, // Optional for now is false but in prod it should be with api.findr.blog
			domain: 'example.com', // Optional. Defaults to the base url domain if not provided
		},
	},

	rateLimit: {
		window: 60, // time window in seconds
		max: 100, // max requests in the window
		customRules: {
			// example of custom rate limit rules
			'/sign-in/email': {
				window: 10,
				max: 3,
			},
			'/two-factor/*': async (request) => {
				// custom function to return rate limit window and max
				return {
					window: 10,
					max: 3,
				}
			},
		},
	},

	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			switch (ctx.path) {
				case '/update-user':
					const isUsernameTaken = await db.select().from(schema.user).where(eq(schema.user.username, ctx.body.username))
					if (isUsernameTaken) {
						throw new APIError('BAD_REQUEST', {
							message: 'Username is already taken',
							status: 304,
						})
					}
					break
				default:
					break
			}
		}),
		after: createAuthMiddleware(async (ctx) => {}),
	},

	plugins: [
		username(),

		twoFactor({
			issuer: config.APP_NAME,
			otpOptions: {
				async sendOTP({ user, otp }, request) {
					await sendEmail({
						to: user.email,
						subject: 'Two factor authentication OTP',
						text: `Your OTP is: ${otp}`,
					})
				},
			},
		}),

		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === 'sign-in') {
					await sendEmail({
						to: email,
						subject: 'Sign in OTP',
						text: `Your OTP is: ${otp}`,
					})
				} else if (type === 'email-verification') {
					await sendEmail({
						to: email,
						subject: 'Email verification OTP',
						text: `Your OTP is: ${otp}`,
					})
				} else {
					await sendEmail({
						to: email,
						subject: 'Password reset OTP',
						text: `Your OTP is: ${otp}`,
					})
				}
			},
			otpLength: 6,
			expiresIn: 600, // 10 minutes
		}),
	],
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
