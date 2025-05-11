import Joi from 'joi'

export const getCommentsSchema = Joi.object({
	page: Joi.number().required(),
})

export const newCommentSchema = Joi.object({
	postId: Joi.string().required(),
	content: Joi.string().required().max(600),
	userId: Joi.string().required(),
})

export const newCommentReplySchema = Joi.object({
	postId: Joi.string().required(),
	commentId: Joi.string().required(),
	content: Joi.string().required().max(600),
	userId: Joi.string().required(),
})
