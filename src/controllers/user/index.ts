import type { Request, Response } from 'express'
import { eq, sql } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/lib/index'

import type { CommentResponse, PostResponse } from '~/lib/types/shared'

export const getUserInfo = handler(async (req: Request, res: Response) => {
	const { username } = req.params

	const preparedUsers = await db
		.select()
		.from(schema.user)
		.where(eq(schema.user.username, sql.placeholder('username')))
		.limit(1)
		.prepare()

	const user = await preparedUsers.execute({ username: username }).then((user) => user[0])

	if (!user) {
		res.status(200).json({
			data: null,
			message: 'User not found',
		})
		return
	}

	const commentsCount = await db.$count(schema.comments, eq(schema.comments.userId, user.id))
	const postsCount = await db.$count(schema.posts, eq(schema.posts.userId, user.id))

	res.status(200).json({
		data: {
			username: user.username,
			image: user.image,
			about_description: user.about_description,

			postsCount: postsCount,
			commentsCount: commentsCount,

			createdAt: user.createdAt,
		},
	})
})

export const getUserData = handler(async (req: Request, res: Response) => {
	const { username } = req.params
	const { type, page } = req.query

	if (!username) {
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

	const users = await db.select().from(schema.user).where(eq(schema.user.username, username)).limit(1)
	if (!users || users.length === 0) {
		res.status(200).json({
			data: null,
			message: 'User not found',
		})
		return
	}

	const userIdString = users[0].id.toString()
	switch (type) {
		case 'overview': {
			const limit = 5
			const offset = (Number(page) - 1) * limit

			let arrayPosts = [] as Partial<PostResponse>[]
			let arrayComments = [] as Partial<CommentResponse>[]
			const posts = await db
				.select()
				.from(schema.posts)
				.where(eq(schema.posts.userId, userIdString))
				.limit(limit + 1)
				.offset(offset)

			const comments = await db
				.select()
				.from(schema.comments)
				.where(eq(schema.comments.userId, userIdString))
				.limit(limit + 1)
				.offset(offset)

			if (comments.length > 0) {
				arrayComments = await Promise.all(
					comments.map(async (comment: CommentResponse) => {
						const newComment = { ...comment } as Partial<CommentResponse>
						delete newComment.userId // removing it from the response

						if (!comment.postId) {
							return newComment
						}

						const post = await db.select().from(schema.posts).where(eq(schema.posts.id, comment.postId)).limit(1)
						if (post) {
							newComment.postTitle = post[0].title
						}

						return newComment
					})
				)
			}

			if (posts.length > 0) {
				arrayPosts = await Promise.all(
					posts.map(async (post: PostResponse) => {
						const newPost = { ...post } as Partial<PostResponse>
						delete newPost.userId

						const upvotes = await db.select().from(schema.upvotes).where(eq(schema.upvotes.postId, post.id))
						const downvotes = await db.select().from(schema.downvotes).where(eq(schema.downvotes.postId, post.id))

						const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
						const downvotesCont = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))

						const likes = (upvotesCount || 0) - (downvotesCont || 0) // Calculate the likes count
						const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

						newPost.likesCount = likes
						newPost.commentsCount = comments.length

						newPost.upvoted = upvotes.some((upvote) => upvote.userId === userIdString) || false
						newPost.downvoted = downvotes.some((downvote) => downvote.userId === userIdString) || false
						return newPost
					})
				)
			}

			const hasNextPage = posts.length > limit
			const paginatedPosts = hasNextPage ? arrayPosts.slice(0, limit) : arrayPosts
			const paginatedComments = hasNextPage ? arrayComments.slice(0, limit) : arrayComments

			res.status(200).json({
				data: { posts: paginatedPosts, comments: paginatedComments },
				nextCursor: hasNextPage ? Number(page) + 1 : undefined,
			})

			break
		}
		case 'posts': {
			const limit = 5
			const offset = (Number(page) - 1) * limit

			let arrayPosts = [] as Partial<PostResponse>[]
			const posts = await db
				.select()
				.from(schema.posts)
				.where(eq(schema.posts.userId, userIdString))
				.limit(limit + 1)
				.offset(offset)

			if (posts.length > 0) {
				arrayPosts = await Promise.all(
					posts.map(async (post: PostResponse) => {
						const newPost = { ...post } as Partial<PostResponse>
						delete newPost.userId

						const upvotes = await db.select().from(schema.upvotes).where(eq(schema.upvotes.postId, post.id))
						const downvotes = await db.select().from(schema.downvotes).where(eq(schema.downvotes.postId, post.id))

						const upvotesCount = await db.$count(schema.upvotes, eq(schema.upvotes.postId, post.id))
						const downvotesCont = await db.$count(schema.downvotes, eq(schema.downvotes.postId, post.id))

						const likes = (upvotesCount || 0) - (downvotesCont || 0) // Calculate the likes count
						const comments = await db.select().from(schema.comments).where(eq(schema.comments.postId, post.id))

						newPost.likesCount = likes
						newPost.commentsCount = comments.length

						newPost.upvoted = upvotes.some((upvote) => upvote.userId === userIdString) || false
						newPost.downvoted = downvotes.some((downvote) => downvote.userId === userIdString) || false
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
			break
		}
		case 'comments': {
			const limit = 5
			const offset = (Number(page) - 1) * limit

			let arrayComments = [] as Partial<CommentResponse>[]
			const comments = await db
				.select()
				.from(schema.comments)
				.where(eq(schema.comments.userId, userIdString))
				.limit(limit + 1)
				.offset(offset)

			if (comments.length > 0) {
				arrayComments = await Promise.all(
					comments.map(async (comment: CommentResponse) => {
						const newComment = { ...comment } as Partial<CommentResponse>
						delete newComment.userId // removing it from the response

						if (!comment.postId) {
							return newComment
						}

						const post = await db.select().from(schema.posts).where(eq(schema.posts.id, comment.postId)).limit(1)
						if (post) {
							newComment.postTitle = post[0].title
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

			break
		}
		default:
			break
	}
})
