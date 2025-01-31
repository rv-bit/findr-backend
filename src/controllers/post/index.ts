import { Request, Response } from 'express'
import * as schema from '#services/database/schema.js'
import db from '#services/database/database.js'

import { handler } from '#utils/index.js'
import { NewPostSchema } from '#routes/post/schema.js'
import logger from '#utils/logger.js'

export const getAllPosts = handler(async (req: Request, res: Response) => {
	res.status(200).json({
		message: 'Hello World!',
	})
})

export const newTestPost = handler(async (req: Request, res: Response) => {
	const { slug, title, content, userId } = req.body as NewPostSchema

	const post = await db.insert(schema.posts).values({
		slug,
		title,
		content,
		userId,

		createdAt: new Date(), // Use the current date as the createdAt value
		updatedAt: new Date(), // Use the current date as the updatedAt value
	})

	if (!post) {
		res.status(401).json({
			message: 'Failed to create post',
		})

		logger.error('Failed to create post', { post })
		return
	}

	res.status(200).json({
		message: 'Success',
	})
})
