export type CommentResponse = {
	// Additional fields not from the database schema
	upvoted?: boolean
	downvoted?: boolean

	likesCount?: number

	post: {
		title: string
		slug: string
	}
	repliedTo?: string | null
}

export type PostResponse = {
	// Additional fields not from the database schema
	likesCount?: number
	commentsCount?: number

	upvoted?: boolean
	downvoted?: boolean
}
