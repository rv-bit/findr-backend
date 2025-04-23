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

	likesCount?: number
	commentsCount?: number
	liked?: boolean
}
