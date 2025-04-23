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

export const likePost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { userId } = req.body as schema.InsertLikes

	const existingLike = await db
		.select()
		.from(schema.likes)
		.where(and(eq(schema.likes.postId, postId), eq(schema.likes.userId, userId)))
		.limit(1)

	if (existingLike.length > 0) {
		res.status(200).json({
			data: 'Already liked',
		})
		return
	}

	// await db.insert(schema.likes).values({
	// 	postId,
	// 	userId,
	// })

	// res.status(200).json({
	// 	data: 'Success',
	// })
})
