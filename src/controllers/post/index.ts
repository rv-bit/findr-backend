import type { Context } from 'hono'
import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/utils/index'
import logger from '~/utils/logger'

import type { NewPostSchema } from '~/routes/post/schema'

export const getAllPosts = handler(async (c: Context) => {
	c.json(
		{
			message: 'Hello World!',
		},
		200
	)
})

export const newTestPost = handler(async (c: Context) => {
	const { slug, title, content, userId } = c.get('body') as NewPostSchema

	const post = await db.insert(schema.posts).values({
		slug,
		title,
		content,
		userId,

		createdAt: new Date(), // Use the current date as the createdAt value
		updatedAt: new Date(), // Use the current date as the updatedAt value
	})

	if (!post) {
		c.json(
			{
				message: 'Failed to create post',
			},
			500
		)

		logger.error('Failed to create post', { post })
		return
	}

	c.json(
		{
			message: 'Success',
		},
		200
	)
})
