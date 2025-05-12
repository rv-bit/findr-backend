import type { Request, Response } from 'express'
import { and, eq } from 'drizzle-orm'
import { fromNodeHeaders } from 'better-auth/node'
import { nanoid } from 'nanoid'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { auth, type Session } from '~/lib/auth'

import { handler } from '~/lib/index'
import logger from '~/lib/logger'

import type { PostResponse } from '~/lib/types/shared'
import type { NewPostSchema } from '~/routes/post/schema'

import { getPostByPostId } from '../shared/post'

export const getAllPosts = handler(async (req: Request, res: Response) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
		query: {
			disableCookieCache: true,
		},
	})

	const { page } = req.query

	const limit = 15
	const offset = (Number(page) - 1) * limit

	let arrayPosts = [] as Partial<
		schema.Posts &
			PostResponse & {
				username: string | null
				avatar: string | null
			}
	>[]
	const posts = await db
		.select()
		.from(schema.posts)
		.limit(limit + 1)
		.offset(offset)

	if (posts.length > 0) {
		arrayPosts = await Promise.all(
			posts.map(async (post: schema.Posts & PostResponse) => {
				const newPost = { ...post } as Partial<
					schema.Posts &
						PostResponse & {
							user: {
								username: string | null
								image: string | null
							}
						}
				>
				delete newPost.userId

				const user = await db
					.select()
					.from(schema.user)
					.where(eq(schema.user.id, post.userId))
					.limit(1)
					.then((user) => user[0])

				const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
				const downvotesCount = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))

				const likes = (upvotesCount || 0) - (downvotesCount || 0) // Calculate the likes count
				const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

				newPost.likesCount = likes
				newPost.commentsCount = comments.length

				if (session && session.user) {
					const userIdString = session.user.id

					const upvoted = await db
						.select()
						.from(schema.upvotes)
						.where(and(eq(schema.upvotes.postId, post.id), eq(schema.upvotes.userId, userIdString)))
						.limit(1)
						.then((upvotes) => {
							return upvotes[0]
						})

					const downvoted = await db
						.select()
						.from(schema.downvotes)
						.where(and(eq(schema.downvotes.postId, post.id), eq(schema.downvotes.userId, userIdString)))
						.limit(1)
						.then((downvotes) => {
							return downvotes[0]
						})

					newPost.upvoted = upvoted ? true : false
					newPost.downvoted = downvoted ? true : false
				}

				newPost.user = {
					username: user.username,
					image: user.image,
				}
				return newPost
			})
		)
	}

	const hasNextPage = posts.length > limit
	const paginatedPosts = hasNextPage ? arrayPosts.slice(0, limit) : arrayPosts

	res.status(200).json({
		data: paginatedPosts,
		nextCursor: hasNextPage ? Number(page) + 1 : undefined,
	})
})

export const getPostById = handler(async (req: Request, res: Response) => {
	const { postId } = req.params

	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
		query: {
			disableCookieCache: true,
		},
	})

	const post = await getPostByPostId(postId, session)

	if (!post) {
		logger.error('Failed to get post', { post })

		res.status(200).json({
			data: null,
			message: 'Post not found',
		})
		return
	}

	res.status(200).json({
		data: post,
	})
})

export const getPostVoteById = handler(async (req: Request, res: Response) => {
	const { postId } = req.params

	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
		query: {
			disableCookieCache: true,
		},
	})

	const data = {} as {
		upvoted: boolean
		downvoted: boolean
	}

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

		data.upvoted = upvoted ? true : false
		data.downvoted = downvoted ? true : false
	}

	res.status(200).json({
		data: data,
	})
})

export const insertPost = handler(async (req: Request, res: Response) => {
	const { slug, title, content, userId } = req.body as NewPostSchema

	await db
		.insert(schema.posts)
		.values({
			id: nanoid(17),
			slug: slug,
			title: title,
			content: content,
			userId: userId,

			createdAt: new Date(), // Use the current date as the createdAt value
			updatedAt: new Date(), // Use the current date as the updatedAt value
		})
		.catch((error) => {
			console.error('Error inserting post', { error })
			logger.error('Error inserting post', { error })

			res.status(500).json({
				data: 'Failed to create post',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})

export const editPost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { content, userId } = req.body as NewPostSchema

	await db
		.update(schema.posts)
		.set({
			content: content,
			userId: userId,

			updatedAt: new Date(), // Use the current date as the updatedAt value
		})
		.where(eq(schema.posts.id, postId))
		.catch((error) => {
			logger.error('Error updating post', { error })

			res.status(500).json({
				data: 'Failed to update post',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})

export const upvotePost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { userId } = req.body as schema.InsertUpvote

	const existingDownVote = await db
		.select()
		.from(schema.downvotes)
		.where(and(eq(schema.downvotes.postId, postId), eq(schema.downvotes.userId, userId)))
		.limit(1)

	const existingUpvote = await db
		.select()
		.from(schema.upvotes)
		.where(and(eq(schema.upvotes.postId, postId), eq(schema.upvotes.userId, userId)))
		.limit(1)

	if (existingDownVote.length > 0) {
		const existingDownvoteId = existingDownVote[0].id

		await db
			.delete(schema.downvotes)
			.where(eq(schema.downvotes.id, existingDownvoteId))
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
			.delete(schema.upvotes)
			.where(eq(schema.upvotes.id, existingVoteId))
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
		.insert(schema.upvotes)
		.values({
			id: nanoid(17),
			postId: postId,
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

export const downvotePost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { userId } = req.body as schema.InsertDownvote

	const existingUpvote = await db
		.select()
		.from(schema.upvotes)
		.where(and(eq(schema.upvotes.postId, postId), eq(schema.upvotes.userId, userId)))
		.limit(1)

	const existingDownVote = await db
		.select()
		.from(schema.downvotes)
		.where(and(eq(schema.downvotes.postId, postId), eq(schema.downvotes.userId, userId)))
		.limit(1)

	if (existingUpvote.length > 0) {
		const existingUpvoteId = existingUpvote[0].id

		await db
			.delete(schema.upvotes)
			.where(eq(schema.upvotes.id, existingUpvoteId))
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
			.delete(schema.downvotes)
			.where(eq(schema.downvotes.id, existingDownvoteId))
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
		.insert(schema.downvotes)
		.values({
			id: nanoid(17),
			postId: postId,
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

export const deletePost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { userId } = req.body as { userId: string }

	// Delete the post if it exists and belongs to the user
	await db
		.delete(schema.posts)
		.where(and(eq(schema.posts.id, postId), eq(schema.posts.userId, userId)))
		.catch((error) => {
			logger.error('Error deleting post', { error })

			res.status(500).json({})
			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})
