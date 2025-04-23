import type { Request, Response } from 'express'
import { and, eq } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/utils/index'
import logger from '~/utils/logger'

import type { NewPostSchema } from '~/routes/post/schema'

export const getAllPosts = handler(async (req: Request, res: Response) => {
	res.status(200).json({
		message: 'Hello World!',
	})
})

export const testGetAllPosts = handler(async (req: Request, res: Response) => {
	const posts = await db.select().from(schema.posts).limit(500)

	if (!posts) {
		res.status(401).json({
			message: 'Failed to get posts',
		})

		logger.error('Failed to get posts', { posts })
		return
	}

	const allPosts = posts.map((post) => {
		return {
			id: post.id,
			slug: post.slug,
			title: post.title,
			content: post.content,
			userId: post.userId,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
		}
	})

	// return all posts
	res.status(200).json(allPosts)
})

export const testWritePosts = handler(async (req: Request, res: Response) => {
	const length = await db.$count(schema.posts)
	const posts: schema.InsertPosts[] = []

	for (let i = length + 1; i < length + 1000; i++) {
		posts.push({
			id: crypto.randomUUID(),
			slug: `test-post-${i}-${Date.now()}`,
			title: 'Test Post ' + i,
			content: 'This is a test post ' + i,
			userId: 'o3P6NXURD4LwOiwEF8xryx4S9bXj4Jin',
			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}

	await db.transaction(async (tx) => {
		await tx.insert(schema.posts).values(posts)
	})

	res.status(200).json({
		message: 'Success',
	})
})

export const newTestPost = handler(async (req: Request, res: Response) => {
	const { slug, title, content, userId } = req.body as NewPostSchema
	let newSlug = slug

	const existingPost = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1)
	if (existingPost.length > 0) {
		newSlug = `${slug}-${existingPost.length + 1}`
	}

	await db
		.insert(schema.posts)
		.values({
			id: crypto.randomUUID(),
			slug: newSlug,
			title,
			content,
			userId,

			createdAt: new Date(), // Use the current date as the createdAt value
			updatedAt: new Date(), // Use the current date as the updatedAt value
		})
		.catch((error) => {
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
			postId,
			userId,
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
			postId,
			userId,
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
