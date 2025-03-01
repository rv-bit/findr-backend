import { mysqlTable, varchar, text, int, timestamp, boolean, uniqueIndex, index, longtext } from 'drizzle-orm/mysql-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

const generateUniqueString = (length: number = 12): string => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let uniqueString = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		uniqueString += characters[randomIndex]
	}
	return uniqueString
}

export const user = mysqlTable('user', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: text('name').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	username: varchar('username', { length: 255 }).unique(),
	displayUsername: text('display_username'),
	twoFactorEnabled: boolean('two_factor_enabled'),
	about_description: text('about_description'),
})

export const session = mysqlTable('session', {
	id: varchar('id', { length: 36 }).primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by'),
})

export const account = mysqlTable('account', {
	id: varchar('id', { length: 36 }).primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
})

export const verification = mysqlTable('verification', {
	id: varchar('id', { length: 36 }).primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at'),
})

export const twoFactor = mysqlTable('two_factor', {
	id: varchar('id', { length: 36 }).primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})

export const posts = mysqlTable(
	'posts',
	{
		id: int().primaryKey().autoincrement(),
		slug: varchar({ length: 256 }).$default(() => generateUniqueString(16)),
		title: varchar({ length: 256 }),
		content: longtext(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id),

		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
	},
	(table) => [uniqueIndex('slug_idx').on(table.slug), index('title_idx').on(table.title)]
)

export const comments = mysqlTable('comments', {
	id: int().primaryKey().autoincrement(),
	postId: int('post_id').references(() => posts.id),
	text: varchar({ length: 256 }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
})

export const followers = mysqlTable(
	'followers',
	{
		followerId: varchar('followerId', { length: 36 })
			.notNull()
			.references(() => user.id),
		followingId: varchar('followingId', { length: 36 })
			.notNull()
			.references(() => user.id),
		followedAt: timestamp('followedAt').notNull(),
	},
	(table) => [
		// composite unique index
		uniqueIndex('follower_following_idx').on(table.followerId, table.followingId),
	]
)

export const likes = mysqlTable('likes', {
	id: int('id').primaryKey().autoincrement(),
	postId: int('postId')
		.notNull()
		.references(() => posts.id),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

export const messages = mysqlTable('messages', {
	id: int('id').primaryKey().autoincrement(),
	senderId: varchar('senderId', { length: 36 })
		.notNull()
		.references(() => user.id),
	receiverId: varchar('receiverId', { length: 36 })
		.notNull()
		.references(() => user.id),
	messageText: text('messageText').notNull(),
	sentAt: timestamp('sentAt').notNull(),
	isRead: boolean('isRead').default(false),
})

export const notifications = mysqlTable('notifications', {
	id: int('id').primaryKey().autoincrement(),
	userId: varchar('userId', { length: 36 })
		.notNull()
		.references(() => user.id),
	type: varchar('type', { length: 50 }).notNull(), // E.g., 'like', 'comment', 'follow'
	relatedUserId: varchar('relatedUserId', { length: 36 }), // If the notification is related to a user
	postId: int('postId').references(() => posts.id), // If the notification is related to a post
	createdAt: timestamp('createdAt').notNull(),
	isRead: boolean('isRead').default(false),
})

export const shares = mysqlTable('shares', {
	id: int('id').primaryKey().autoincrement(),
	postId: int('postId')
		.notNull()
		.references(() => posts.id),
	userId: varchar('userId', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

type User = InferSelectModel<typeof user>
type Session = InferSelectModel<typeof session>
type Account = InferSelectModel<typeof account>
type Verification = InferSelectModel<typeof verification>

type InsertUser = InferInsertModel<typeof user>
type InsertSession = InferInsertModel<typeof session>
type InsertAccount = InferInsertModel<typeof account>
type InsertVerification = InferInsertModel<typeof verification>

type Followers = InferSelectModel<typeof followers>
type InsertFollowers = InferInsertModel<typeof followers>

type Likes = InferSelectModel<typeof likes>
type InsertLikes = InferInsertModel<typeof likes>

type Messages = InferSelectModel<typeof messages>
type InsertMessages = InferInsertModel<typeof messages>

type Notifications = InferSelectModel<typeof notifications>
type InsertNotifications = InferInsertModel<typeof notifications>

type Shares = InferSelectModel<typeof shares>
type InsertShares = InferInsertModel<typeof shares>

export type { User, Session, Account, Verification }
export type { InsertUser, InsertSession, InsertAccount, InsertVerification }

export type { Followers, InsertFollowers }
export type { Likes, InsertLikes }
export type { Messages, InsertMessages }
export type { Notifications, InsertNotifications }
export type { Shares, InsertShares }
