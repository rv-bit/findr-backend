import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/utils/index'
import type { CommentResponse, PostResponse } from './schema'

export const getUserInfo = handler(async (req: Request, res: Response) => {
	const { username } = req.params

	const users = await db.select().from(schema.user).where(eq(schema.user.username, username)).limit(1)
	if (!users || users.length === 0) {
		res.status(200).json({
			data: null,
			message: 'User not found',
		})
		return
	}

	const userInfo = users[0]
	res.status(200).json({
		data: {
			id: userInfo.id,
			username: userInfo.username,
			image: userInfo.image,
			about_description: userInfo.about_description,
		},
	})
})

export const getUserData = handler(async (req: Request, res: Response) => {
	const { type, page } = req.query
	const { userId } = req.params

	if (!userId) {
		res.status(400).json({
			data: null,
			message: 'User ID is required',
		})
		return
	}

	if (!type) {
		res.status(400).json({
			data: null,
			message: 'Type is required',
		})
		return
	}

	const userIdString = String(userId).trim()

	const users = await db.select().from(schema.user).where(eq(schema.user.id, userIdString)).limit(1)
	if (!users || users.length === 0) {
		res.status(200).json({
			data: null,
			message: 'User not found',
		})
		return
	}

	switch (type as string) {
		case 'overview':
			const limit = 5
			const offset = (Number(page) - 1) * limit

			let arrayPosts = [] as PostResponse[]
			const posts = await db
				.select()
				.from(schema.posts)
				.where(eq(schema.posts.userId, userIdString))
				.limit(limit + 1)
				.offset(offset)

			if (posts.length > 0) {
				arrayPosts = await Promise.all(
					posts.map(async (post: PostResponse) => {
						const likes = await db.select().from(schema.likes).where(eq(schema.likes.postId, post.id))

						const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

						post.likesCount = likes.length
						post.comments = comments as CommentResponse[]

						return post
					})
				)
			}

			const hasNextPage = posts.length > limit
			const paginatedPosts = hasNextPage ? arrayPosts.slice(0, limit) : arrayPosts

			res.status(200).json({
				data: paginatedPosts,
				nextCursor: hasNextPage ? Number(page) + 1 : undefined,
			})

			break
		default:
			break
	}
})
