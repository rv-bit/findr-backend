import { mysqlTable, varchar, text, timestamp, boolean, uniqueIndex, index, longtext } from 'drizzle-orm/mysql-core'
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

export const posts = mysqlTable('posts', {
	id: varchar('id', { length: 36 }).primaryKey(),
	slug: varchar({ length: 256 }).notNull(),
	title: varchar({ length: 256 }).notNull(),
	content: longtext().notNull(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),

	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
})

export const comments = mysqlTable('comments', {
	id: varchar('id', { length: 36 }).primaryKey(),
	postId: varchar('post_id', { length: 36 })
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	parentId: varchar('parent_id', { length: 36 }), // self-referencing
	text: longtext().notNull(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
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

export const upvotes = mysqlTable('upvotes', {
	id: varchar('id', { length: 36 }).primaryKey(),
	postId: varchar('postId', { length: 36 })
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

export const downvotes = mysqlTable('downvotes', {
	id: varchar('id', { length: 36 }).primaryKey(),
	postId: varchar('postId', { length: 36 })
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

export const comments_upvotes = mysqlTable('comments_upvotes', {
	id: varchar('id', { length: 36 }).primaryKey(),
	commentId: varchar('commentId', { length: 36 })
		.notNull()
		.references(() => comments.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

export const comments_downvotes = mysqlTable('comments_downvotes', {
	id: varchar('id', { length: 36 }).primaryKey(),
	commentId: varchar('commentId', { length: 36 })
		.notNull()
		.references(() => comments.id, { onDelete: 'cascade' }),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull(),
})

export const messages = mysqlTable('messages', {
	id: varchar('id', { length: 36 }).primaryKey(),
	senderId: varchar('senderId', { length: 36 })
		.notNull()
		.references(() => user.id),
	receiverId: varchar('receiverId', { length: 36 })
		.notNull()
		.references(() => user.id),
	messageText: text('messageText').notNull(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	isRead: boolean('isRead').default(false),
})

export const notifications = mysqlTable('notifications', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('userId', { length: 36 })
		.notNull()
		.references(() => user.id),
	type: varchar('type', { length: 50 }).notNull(), // E.g., 'like', 'comment', 'follow'
	relatedUserId: varchar('relatedUserId', { length: 36 }).references(() => user.id), // If the notification is related to another user
	postId: varchar('postId', { length: 36 }).references(() => posts.id, { onDelete: 'cascade' }), // If the notification is related to a post
	createdAt: timestamp('createdAt').notNull(),
	isRead: boolean('isRead').default(false),
})

export const shares = mysqlTable('shares', {
	id: varchar('id', { length: 36 }).primaryKey(),
	postId: varchar('postId', { length: 36 })
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
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

type Posts = InferSelectModel<typeof posts>
type InsertPosts = InferInsertModel<typeof posts>

type Comments = InferSelectModel<typeof comments>
type InsertComments = InferInsertModel<typeof comments>

type Followers = InferSelectModel<typeof followers>
type InsertFollowers = InferInsertModel<typeof followers>

type Upvote = InferSelectModel<typeof upvotes>
type InsertUpvote = InferInsertModel<typeof upvotes>

type Downvote = InferSelectModel<typeof downvotes>
type InsertDownvote = InferInsertModel<typeof downvotes>

type CommentsUpvote = InferSelectModel<typeof comments_upvotes>
type InsertCommentsUpvote = InferInsertModel<typeof comments_upvotes>

type CommentsDownvote = InferSelectModel<typeof comments_downvotes>
type InsertCommentsDownvote = InferInsertModel<typeof comments_downvotes>

type Messages = InferSelectModel<typeof messages>
type InsertMessages = InferInsertModel<typeof messages>

type Notifications = InferSelectModel<typeof notifications>
type InsertNotifications = InferInsertModel<typeof notifications>

type Shares = InferSelectModel<typeof shares>
type InsertShares = InferInsertModel<typeof shares>

export type { User, Session, Account, Verification }
export type { InsertUser, InsertSession, InsertAccount, InsertVerification }

export type { Followers, InsertFollowers }
export type { Posts, InsertPosts }
export type { Comments, InsertComments }

export type { Upvote, InsertUpvote }
export type { Downvote, InsertDownvote }

export type { CommentsUpvote, InsertCommentsUpvote }
export type { CommentsDownvote, InsertCommentsDownvote }

export type { Messages, InsertMessages }
export type { Notifications, InsertNotifications }
export type { Shares, InsertShares }
