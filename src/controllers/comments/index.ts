import type { Request, Response } from 'express'
import { eq, and, isNull, desc, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/lib/index'
import logger from '~/lib/logger'

export const getCommentsByPost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { page } = req.query

	const limit = 15
	const offset = (Number(page) - 1) * limit

	let arrayComments = [] as Partial<
		schema.Comments & {
			username: string | null
			avatar: string | null
		}
	>[]

	const comments = await db
		.select()
		.from(schema.comments)
		.where(and(eq(schema.comments.postId, postId as string), isNull(schema.comments.parentId)))
		.orderBy(asc(schema.comments.createdAt))
		.limit(limit + 1)
		.offset(offset)

	if (comments.length > 0) {
		arrayComments = await Promise.all(
			comments.map(async (comment: schema.Comments) => {
				const newComment = { ...comment } as Partial<
					schema.Comments & {
						user: {
							username: string | null
							image: string | null
						}
					}
				>

				const user = await db
					.select()
					.from(schema.user)
					.where(eq(schema.user.id, comment.userId))
					.limit(1)
					.then((user) => {
						return user[0]
					})

				delete newComment.userId

				newComment.user = {
					username: user.username,
					image: user.image,
				}

				return newComment
			})
		)
	}

	const hasNextPage = comments.length > limit
	const paginatedComments = hasNextPage ? comments.slice(0, limit) : arrayComments

	res.status(200).json({
		data: paginatedComments,
		nextCursor: hasNextPage ? Number(page) + 1 : undefined,
	})
})

export const getRepliesByComment = handler(async (req: Request, res: Response) => {
	const { commentId } = req.params
	const { page } = req.query

	const limit = 10
	const offset = (Number(page) - 1) * limit

	let arrayReplies = [] as Partial<
		schema.Comments & {
			username: string | null
			avatar: string | null
		}
	>[]

	const replies = await db
		.select()
		.from(schema.comments)
		.where(eq(schema.comments.parentId, commentId as string))
		.orderBy(desc(schema.comments.createdAt))
		.limit(limit + 1)
		.offset(offset)

	if (replies.length > 0) {
		arrayReplies = await Promise.all(
			replies.map(async (reply: schema.Comments) => {
				const newReply = { ...reply } as Partial<
					schema.Comments & {
						user: {
							username: string | null
							image: string | null
						}
					}
				>

				const user = await db
					.select()
					.from(schema.user)
					.where(eq(schema.user.id, reply.userId))
					.limit(1)
					.then((user) => {
						return user[0]
					})

				delete newReply.userId

				newReply.user = {
					username: user.username,
					image: user.image,
				}

				return newReply
			})
		)
	}

	const hasNextPage = replies.length > limit
	const paginatedReplies = hasNextPage ? replies.slice(0, limit) : arrayReplies

	res.status(200).json({
		data: paginatedReplies,
		nextCursor: hasNextPage ? Number(page) + 1 : undefined,
	})
})

export const createComment = handler(async (req: Request, res: Response) => {
	const { content, userId, postId } = req.body

	await db
		.insert(schema.comments)
		.values({
			id: nanoid(17),
			text: content,
			userId: userId,
			postId: postId,

			createdAt: new Date(), // Use the current date as the createdAt value
			updatedAt: new Date(), // Use the current date as the updatedAt value
		})
		.catch((error) => {
			logger.error('Error inserting comment:', error)

			res.status(500).json({
				data: 'Failed to insert comment',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})

export const createReply = handler(async (req: Request, res: Response) => {
	const { content, userId, postId, commentId } = req.body

	await db
		.insert(schema.comments)
		.values({
			id: nanoid(17),
			text: content,
			userId: userId,
			postId: postId,
			parentId: commentId,

			createdAt: new Date(), // Use the current date as the createdAt value
			updatedAt: new Date(), // Use the current date as the updatedAt value
		})
		.catch((error) => {
			logger.error('Error inserting reply:', error)

			res.status(500).json({
				data: 'Failed to insert reply',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})
