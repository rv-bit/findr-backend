import type { Request, Response } from 'express'
import { eq, and, isNull, desc, asc } from 'drizzle-orm'
import { fromNodeHeaders } from 'better-auth/node'
import { nanoid } from 'nanoid'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { auth, handler } from '~/lib/index'
import logger from '~/lib/logger'

export const getCommentsByPost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { page } = req.query

	const limit = 15
	const offset = (Number(page) - 1) * limit

	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
		query: {
			disableCookieCache: true,
		},
	})

	let arrayComments = [] as Partial<
		schema.Comments & {
			user: {
				username: string | null
				image: string | null
			}
			upvoted?: boolean
			downvoted?: boolean
		}
	>[]

	const comments = await db
		.select()
		.from(schema.comments)
		.where(and(eq(schema.comments.postId, postId), isNull(schema.comments.parentId)))
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

						upvoted?: boolean
						downvoted?: boolean
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

				if (session && session.user) {
					const userIdString = session.user.id

					const upvote = await db
						.select()
						.from(schema.comments_upvotes)
						.where(and(eq(schema.comments_upvotes.commentId, comment.id), eq(schema.comments_upvotes.userId, userIdString)))
						.limit(1)
						.then((upvotes) => {
							return upvotes[0]
						})

					const downvote = await db
						.select()
						.from(schema.comments_downvotes)
						.where(and(eq(schema.comments_downvotes.commentId, comment.id), eq(schema.comments_downvotes.userId, userIdString)))
						.limit(1)
						.then((downvotes) => {
							return downvotes[0]
						})

					newComment.upvoted = upvote ? true : false
					newComment.downvoted = downvote ? true : false
				}

				return newComment
			})
		)
	}

	const hasNextPage = comments.length > limit
	const paginatedComments = hasNextPage ? arrayComments.slice(0, limit) : arrayComments

	res.status(200).json({
		data: paginatedComments,
		nextCursor: hasNextPage ? Number(page) + 1 : undefined,
	})
})

export const getRepliesByComment = handler(async (req: Request, res: Response) => {
	const { commentId } = req.params
	const { page } = req.query

	const limit = 5
	const offset = (Number(page) - 1) * limit

	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
		query: {
			disableCookieCache: true,
		},
	})

	let arrayReplies = [] as Partial<
		schema.Comments & {
			user: {
				username: string | null
				image: string | null
			}
			upvoted?: boolean
			downvoted?: boolean
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
						upvoted?: boolean
						downvoted?: boolean
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

				if (session && session.user) {
					const userIdString = session.user.id

					const upvote = await db
						.select()
						.from(schema.comments_upvotes)
						.where(and(eq(schema.comments_upvotes.commentId, reply.id), eq(schema.comments_upvotes.userId, userIdString)))
						.limit(1)
						.then((upvotes) => {
							return upvotes[0]
						})

					const downvote = await db
						.select()
						.from(schema.comments_downvotes)
						.where(and(eq(schema.comments_downvotes.commentId, reply.id), eq(schema.comments_downvotes.userId, userIdString)))
						.limit(1)
						.then((downvotes) => {
							return downvotes[0]
						})

					newReply.upvoted = upvote ? true : false
					newReply.downvoted = downvote ? true : false
				}

				return newReply
			})
		)
	}

	const hasNextPage = replies.length > limit
	const paginatedReplies = hasNextPage ? arrayReplies.slice(0, limit) : arrayReplies

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

export const upvoteComment = handler(async (req: Request, res: Response) => {
	const { commentId } = req.params
	const { userId } = req.body as schema.InsertUpvote

	const existingDownVote = await db
		.select()
		.from(schema.comments_downvotes)
		.where(and(eq(schema.comments_downvotes.commentId, commentId), eq(schema.comments_downvotes.userId, userId)))
		.limit(1)

	const existingUpvote = await db
		.select()
		.from(schema.comments_upvotes)
		.where(and(eq(schema.comments_upvotes.commentId, commentId), eq(schema.comments_upvotes.userId, userId)))
		.limit(1)

	if (existingDownVote.length > 0) {
		const existingDownvoteId = existingDownVote[0].id

		await db
			.delete(schema.comments_downvotes)
			.where(eq(schema.comments_downvotes.id, existingDownvoteId))
			.catch((error) => {
				logger.error('Error removing downvote', { error })

				res.status(500).json({
					data: 'Failed to unlike post',
				})

				return null
			})
	}

	if (existingUpvote.length > 0) {
		const existingVoteId = existingUpvote[0].id

		await db
			.delete(schema.comments_upvotes)
			.where(eq(schema.comments_upvotes.id, existingVoteId))
			.catch((error) => {
				logger.error('Error removing upvote', { error })

				res.status(500).json({
					data: 'Failed to unlike post',
				})

				return null
			})

		res.status(200).json({
			data: 'Success',
		})
		return
	}

	await db
		.insert(schema.comments_upvotes)
		.values({
			id: nanoid(17),
			commentId: commentId,
			userId: userId,
			createdAt: new Date(), // Use the current date as the createdAt value
		})
		.catch((error) => {
			logger.error('Error inserting upvote', { error })

			res.status(500).json({
				data: 'Failed to upvote post',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})

export const downvoteComment = handler(async (req: Request, res: Response) => {
	const { commentId } = req.params
	const { userId } = req.body as schema.InsertDownvote

	const existingUpvote = await db
		.select()
		.from(schema.comments_upvotes)
		.where(and(eq(schema.comments_upvotes.commentId, commentId), eq(schema.comments_upvotes.userId, userId)))
		.limit(1)

	const existingDownVote = await db
		.select()
		.from(schema.comments_downvotes)
		.where(and(eq(schema.comments_downvotes.commentId, commentId), eq(schema.comments_downvotes.userId, userId)))
		.limit(1)

	if (existingUpvote.length > 0) {
		const existingUpvoteId = existingUpvote[0].id

		await db
			.delete(schema.comments_upvotes)
			.where(eq(schema.comments_upvotes.id, existingUpvoteId))
			.catch((error) => {
				logger.error('Error removing upvote', { error })

				res.status(500).json({
					data: 'Failed to unlike post',
				})

				return null
			})
	}

	if (existingDownVote.length > 0) {
		const existingDownvoteId = existingDownVote[0].id

		await db
			.delete(schema.comments_downvotes)
			.where(eq(schema.comments_downvotes.id, existingDownvoteId))
			.catch((error) => {
				logger.error('Error removing downvote', { error })

				res.status(500).json({
					data: 'Failed to unlike post',
				})

				return null
			})

		res.status(200).json({
			data: 'Success',
		})
		return
	}

	await db
		.insert(schema.comments_downvotes)
		.values({
			id: nanoid(17),
			commentId: commentId,
			userId: userId,
			createdAt: new Date(), // Use the current date as the createdAt value
		})
		.catch((error) => {
			logger.error('Error inserting downvote', { error })

			res.status(500).json({})
			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})
