export type CommentResponse = {
	id: number
	text: string
	userId: string
	postId: number
	createdAt: Date
	updatedAt: Date
}

export type PostResponse = {
	id: number
	slug: string | null
	title: string | null
	content: string | null
	userId: string
	createdAt: Date
	updatedAt: Date

	likesCount?: number
	comments?: CommentResponse[]
}
