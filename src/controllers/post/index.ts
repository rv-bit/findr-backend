import type { Request, Response } from 'express'
import { and, eq } from 'drizzle-orm'
import { fromNodeHeaders } from 'better-auth/node'
import { nanoid } from 'nanoid'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { auth, handler } from '~/lib/index'
import logger from '~/lib/logger'

import type { NewPostSchema } from '~/routes/post/schema'
import type { PostResponse } from '~/lib/types/shared'

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
			posts.map(async (post: PostResponse) => {
				const newPost = { ...post } as Partial<
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

				const upvotes = await db.select().from(schema.upvotes).where(eq(schema.upvotes.postId, post.id))
				const downvotes = await db.select().from(schema.downvotes).where(eq(schema.downvotes.postId, post.id))

				const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
				const downvotesCont = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))

				const likes = (upvotesCount || 0) - (downvotesCont || 0) // Calculate the likes count
				const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

				newPost.likesCount = likes
				newPost.commentsCount = comments.length

				if (session && session.user) {
					const userIdString = session.user.id

					newPost.upvoted = upvotes.some((upvote) => upvote.userId === userIdString) || false
					newPost.downvoted = downvotes.some((downvote) => downvote.userId === userIdString) || false
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

	const post = await db
		.select()
		.from(schema.posts)
		.where(eq(schema.posts.id, postId))
		.limit(1)
		.then((post) => post[0])

	if (!post) {
		res.status(401).json({
			message: 'Failed to get post',
		})

		logger.error('Failed to get post', { post })
		return
	}

	const copyPost = { ...post } as Partial<
		PostResponse & {
			user: {
				username: string | null
				image: string | null
			}
		}
	>

	const upvotes = await db.select().from(schema.upvotes).where(eq(schema.upvotes.postId, post.id))
	const downvotes = await db.select().from(schema.downvotes).where(eq(schema.downvotes.postId, post.id))

	const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
	const downvotesCont = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))

	const likes = (upvotesCount || 0) - (downvotesCont || 0) // Calculate the likes count
	const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

	copyPost.likesCount = likes
	copyPost.commentsCount = comments.length

	console.log('session.user', session)

	if (session && session.user) {
		const userIdString = session.user.id

		copyPost.upvoted = upvotes.some((upvote) => upvote.userId === userIdString) || false
		copyPost.downvoted = downvotes.some((downvote) => downvote.userId === userIdString) || false
	}

	const user = await db
		.select()
		.from(schema.user)
		.where(eq(schema.user.id, post.userId))
		.limit(1)
		.then((user) => user[0])

	delete copyPost.userId

	copyPost.user = {
		username: user.username,
		image: user.image,
	}

	res.status(200).json({
		data: copyPost,
	})
})

export const insertPost = handler(async (req: Request, res: Response) => {
	const { slug, title, content, userId } = req.body as NewPostSchema

	await db
		.insert(schema.posts)
		.values({
			id: nanoid(16),
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

			res.status(401).json({
				data: 'Failed to create post',
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

				res.status(401).json({
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

				res.status(401).json({
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
			id: crypto.randomUUID(),
			postId: postId,
			userId: userId,
			createdAt: new Date(), // Use the current date as the createdAt value
		})
		.catch((error) => {
			logger.error('Error inserting upvote', { error })

			res.status(401).json({
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

				res.status(401).json({
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

				res.status(401).json({
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
			id: crypto.randomUUID(),
			postId: postId,
			userId: userId,
			createdAt: new Date(), // Use the current date as the createdAt value
		})
		.catch((error) => {
			logger.error('Error inserting downvote', { error })

			res.status(401).json({
				data: 'Failed to downvote post',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})

export const deletePost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params

	await db
		.delete(schema.posts)
		.where(eq(schema.posts.id, postId))
		.catch((error) => {
			logger.error('Error deleting post', { error })

			res.status(401).json({
				data: 'Failed to delete post',
			})

			return null
		})

	res.status(200).json({
		data: 'Success',
	})
})
