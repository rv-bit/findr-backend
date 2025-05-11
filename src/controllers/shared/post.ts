import { and, eq } from 'drizzle-orm'

import { type Session } from '~/lib/auth'
import logger from '~/lib/logger'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import type { PostResponse } from '~/lib/types/shared'

export const getPostByPostId = async (postId: string, session?: Session | null) => {
	const post = await db
		.select()
		.from(schema.posts)
		.where(eq(schema.posts.id, postId))
		.limit(1)
		.then((post) => post[0])

	if (!post) {
		logger.error('Failed to get post', { post })

		return null
	}

	const copyPost = { ...post } as Partial<
		PostResponse & {
			user: {
				username: string | null
				image: string | null

				createdAt: Date | null
			}
		}
	>

	const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
	const downvotesCount = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))
	const commentsCount = await db.$count(schema.comments, eq(schema.comments.postId, post.id))

	copyPost.likesCount = (upvotesCount || 0) - (downvotesCount || 0) // Calculate the likes count
	copyPost.commentsCount = commentsCount

	const user = await db
		.select()
		.from(schema.user)
		.where(eq(schema.user.id, post.userId))
		.limit(1)
		.then((user) => user[0])

	if (session && session.user) {
		const userIdString = session.user.id

		const upvoted = await db
			.select()
			.from(schema.upvotes)
			.where(and(eq(schema.upvotes.postId, postId), eq(schema.upvotes.userId, userIdString)))
			.limit(1)
			.then((upvotes) => {
				return upvotes[0]
			})

		const downvoted = await db
			.select()
			.from(schema.downvotes)
			.where(and(eq(schema.downvotes.postId, postId), eq(schema.downvotes.userId, userIdString)))
			.limit(1)
			.then((downvotes) => {
				return downvotes[0]
			})

		copyPost.upvoted = upvoted ? true : false
		copyPost.downvoted = downvoted ? true : false
	}

	delete copyPost.userId

	copyPost.user = {
		username: user.username,
		image: user.image,
		createdAt: user.createdAt,
	}

	return copyPost
}
