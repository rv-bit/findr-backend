export type CommentResponse = {
	id: string
	postId: string
	text: string | null
	userId: string
	createdAt: Date
	updatedAt: Date

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
	likesCount?: number
	commentsCount?: number

	upvoted?: boolean
	downvoted?: boolean
}
