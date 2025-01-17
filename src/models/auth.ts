import { mysqlTable, varchar, text, int, timestamp, boolean } from 'drizzle-orm/mysql-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export const user = mysqlTable("user", {
	id: varchar("id", { length: 36 }).primaryKey(),
	name: text('name').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	twoFactorEnabled: boolean('two_factor_enabled')
});

export const session = mysqlTable("session", {
	id: varchar("id", { length: 36 }).primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id)
});

export const account = mysqlTable("account", {
	id: varchar("id", { length: 36 }).primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = mysqlTable("verification", {
	id: varchar("id", { length: 36 }).primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const twoFactor = mysqlTable("two_factor", {
	id: varchar("id", { length: 36 }).primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id)
});


type User = InferSelectModel<typeof user>
type Session = InferSelectModel<typeof session>
type Account = InferSelectModel<typeof account>
type Verification = InferSelectModel<typeof verification>

type InsertUser = InferInsertModel<typeof user>
type InsertSession = InferInsertModel<typeof session>
type InsertAccount = InferInsertModel<typeof account>
type InsertVerification = InferInsertModel<typeof verification>

export type { User, Session, Account, Verification }
export type { InsertUser, InsertSession, InsertAccount, InsertVerification }
