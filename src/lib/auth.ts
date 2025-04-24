import 'dotenv/config'

import { betterAuth } from 'better-auth'
import type { User } from 'better-auth/types'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, createAuthMiddleware, emailOTP, twoFactor, username } from 'better-auth/plugins'

import { eq } from 'drizzle-orm'

import config from '~/config'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { sendEmail } from '~/services/email/service'
import { reactResetPasswordEmail } from '~/services/email/templates'

import { deleteUserAvatar, uploadUserAvatar } from '~/services/s3/avatar-client'

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
	appName: config.APP_NAME,
	database: drizzleAdapter(db, {
		provider: 'mysql',
		schema: schema,
	}),

	basePath: '/auth',
	baseURL:
		process.env.NODE_ENV === 'development' ? process.env.BETTER_AUTH_URL
		: process.env.BETTER_AUTH_URL?.startsWith('http') ? process.env.BETTER_AUTH_URL
		: `https://${process.env.BETTER_AUTH_URL}`,
	trustedOrigins: trustedOrigins || ['http://localhost:3000'],

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			// redirectURI: process.env.NODE_ENV === 'development' ? process.env.BETTER_AUTH_URL + '/auth/callback/github/' : (process.env.BETTER_AUTH_URL?.startsWith('http') ? process.env.BETTER_AUTH_URL : `https://${process.env.BETTER_AUTH_URL}`) + '/auth/callback/github/',
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
			// redirectURI: process.env.NODE_ENV === 'development' ? process.env.BETTER_AUTH_URL + '/auth/callback/google/' : (process.env.BETTER_AUTH_URL?.startsWith('http') ? process.env.BETTER_AUTH_URL : `https://${process.env.BETTER_AUTH_URL}`) + '/auth/callback/google/',
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

	account: {
		accountLinking: {
			enabled: true,
			// allowDifferentEmails: true,
			trustedProviders: ['google', 'github'],
		},
	},

	user: {
		additionalFields: {
			about_description: {
				type: 'string',
				required: false,
				defaultValue: '',
			},
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
				const urlObj = new URL(url)
				const callbackURL = urlObj.searchParams.get('callbackURL')
				const newUrl =
					(process.env.NODE_ENV === 'development' ? process.env.BASE_URL
					: process.env.BASE_URL?.startsWith('http') ? process.env.BASE_URL
					: `https://${process.env.BASE_URL}`) +
					callbackURL! +
					'?token=' +
					token

				await sendEmail({
					to: user.email, // verification email must be sent to the current user email to approve the change
					subject: `Approve email change to - ${newEmail}`,
					text: `Click the link to approve the change: ${newUrl}`,
				})
			},
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }, request) => {
				const urlObj = new URL(url)
				const callbackURL = urlObj.searchParams.get('callbackURL')
				const newUrl =
					(process.env.NODE_ENV === 'development' ? process.env.BASE_URL
					: process.env.BASE_URL?.startsWith('http') ? process.env.BASE_URL
					: `https://${process.env.BASE_URL}`) +
					callbackURL! +
					'?token=' +
					token

				await sendEmail({
					to: user.email,
					subject: 'Delete your account',
					text: `Click the link to delete your account: ${newUrl}`,
				})
			},
			beforeDelete: async (user, request) => {
				await deleteUserAvatar(user.image)
				// any other actions before deleting the user
			},
		},
	},

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			const urlObj = new URL(url)
			const callbackURL = urlObj.searchParams.get('callbackURL')
			const newUrl =
				(process.env.NODE_ENV === 'development' ? process.env.BASE_URL
				: process.env.BASE_URL?.startsWith('http') ? process.env.BASE_URL
				: `https://${process.env.BASE_URL}`) +
				callbackURL! +
				'?token=' +
				token

			await sendEmail({
				to: user.email,
				subject: 'Reset your password',
				html: await reactResetPasswordEmail({
					username: user.name, // not really a username, but the name of the user
					resetLink: newUrl,
				}),
			})
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: false,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			if (!user) return // if user doesn't exist, don't send the email or the user just changed the email

			const urlObj = new URL(url)
			const callbackURL = urlObj.searchParams.get('callbackURL')
			const newUrl =
				(process.env.NODE_ENV === 'development' ? process.env.BASE_URL
				: process.env.BASE_URL?.startsWith('http') ? process.env.BASE_URL
				: `https://${process.env.BASE_URL}`) +
				callbackURL! +
				'?token=' +
				token

			await sendEmail({
				to: user.email,
				subject: 'Verify your email address',
				text: `Click the link to verify your email: ${newUrl}`,
			})
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 2, // 2 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
		freshAge: 0, // 60 * 60 * 24 = 1 day (if the session is older than 1 day, it's considered not fresh)

		cookieCache: {
			// Cache the session cookie for 1 minute
			enabled: true,
			maxAge: 1 * 60, // Cache duration in seconds
		},
	},

	rateLimit: {
		window: 40, // time window in seconds
		max: 100, // max requests in the window
		customRules: {
			// example of custom rate limit rules
			'/sign-in/email': {
				window: 10,
				max: 3,
			},
			'/two-factor/*': async (request) => {
				return {
					window: 10,
					max: 3,
				}
			},
		},
	},

	databaseHooks: {
		user: {
			create: {
				before: async (user: User & { username?: string; about_description?: string }) => {
					if (user.username) {
						const isUsernameTaken = await db.select().from(schema.user).where(eq(schema.user.username, user.username))
						if (isUsernameTaken.length > 0) {
							return false
						}
					}

					return {
						data: user,
					}
				},
			},
			update: {
				after: async (user: User & { username?: string; about_description?: string }) => {
					if (user?.id) {
						const oldUserData = await db.select().from(schema.user).where(eq(schema.user.id, user.id))
						if (oldUserData[0].image !== user.image) {
							await deleteUserAvatar(oldUserData[0].image)
						}
					}
				},
			},
		},
	},

	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			switch (ctx.path) {
				case '/update-user':
					if (ctx.body.image) {
						const avatarUrl = await uploadUserAvatar(ctx.body.image)
						if (!avatarUrl) {
							throw new APIError('BAD_REQUEST', {
								message: 'Failed to upload image',
								status: 304,
							})
						}

						return {
							context: {
								...ctx,
								body: {
									...ctx.body,
									image: avatarUrl,
								},
							},
						}
					}

					if (ctx.body.username) {
						const isUsernameTaken = await db.select().from(schema.user).where(eq(schema.user.username, ctx.body.username))
						if (isUsernameTaken.length > 0) {
							throw new APIError('BAD_REQUEST', {
								message: 'Username is already taken',
								status: 304,
							})
						}
					}
					break
				default:
					break
			}
		}),
		after: createAuthMiddleware(async (ctx) => {
			const url =
				process.env.NODE_ENV === 'development' ? process.env.BASE_URL
				: process.env.BASE_URL?.startsWith('http') ? process.env.BASE_URL
				: `https://${process.env.BASE_URL}`

			switch (ctx.query?.error) {
				case 'account_already_linked_to_different_user':
					throw ctx.redirect(`${url}/error/?error=account_already_linked_to_different_user`)
				case "email_doesn't_match":
					throw ctx.redirect(`${url}/error/?error=email_doesnt_match`)
				default:
					break
			}
		}),
	},

	plugins: [
		username(),
		admin(),
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
