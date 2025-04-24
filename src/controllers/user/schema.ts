export type CommentResponse = {
	id: string
	postId: string
	text: string | null
	userId: string
	createdAt: Date
	updatedAt: Date

	username?: string | null
	postTitle?: string | null
}

export type PostResponse = {
	id: string
	slug: string | null
	title: string | null
	content: string | null
	userId: string
	createdAt: Date
	updatedAt: Date

	// Additional fields not from the database schema
	username?: string
	likesCount?: number
	commentsCount?: number

	upvoted?: boolean
	downvoted?: boolean
}
