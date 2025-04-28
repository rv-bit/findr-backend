import type { Request, Response } from 'express'
import { eq, and, isNull, desc, asc } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/lib/index'

export const getCommentsByPost = handler(async (req: Request, res: Response) => {
	const { postId } = req.params
	const { page } = req.query

	const limit = 15
	const offset = (Number(page) - 1) * limit

	const comments = await db
		.select()
		.from(schema.comments)
		.where(and(eq(schema.comments.postId, postId as string), isNull(schema.comments.parentId)))
		.orderBy(asc(schema.comments.createdAt))
		.limit(limit + 1)
		.offset(offset)

	const hasNextPage = comments.length > limit
	const paginatedComments = hasNextPage ? comments.slice(0, limit) : comments

	console.log('paginatedComments', paginatedComments)

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

	const replies = await db
		.select()
		.from(schema.comments)
		.where(eq(schema.comments.parentId, commentId as string))
		.orderBy(desc(schema.comments.createdAt))
		.limit(limit + 1)
		.offset(offset)

	const hasNextPage = replies.length > limit
	const paginatedReplies = hasNextPage ? replies.slice(0, limit) : replies

	res.status(200).json({
		data: paginatedReplies,
		nextCursor: hasNextPage ? Number(page) + 1 : undefined,
	})
})
