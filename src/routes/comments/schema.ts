import Joi from 'joi'

export const getCommentsSchema = Joi.object({
	page: Joi.number().required(),
})

export const newCommentSchema = Joi.object({
	postId: Joi.string().required(),
	content: Joi.string().required(),
	userId: Joi.string().required(),
})

export const newCommentReplySchema = Joi.object({
	postId: Joi.string().required(),
	commentId: Joi.string().required(),
	content: Joi.string().required(),
	userId: Joi.string().required(),
})
