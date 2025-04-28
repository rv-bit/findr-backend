import Joi from 'joi'

export interface NewPostSchema {
	slug: string
	title: string
	content: string
	userId: string
}

export const newPostSchema = Joi.object({
	slug: Joi.string().required(),
	title: Joi.string().required(),
	content: Joi.string().required(),
	userId: Joi.string().required(),
})

export const editPostSchema = Joi.object({
	content: Joi.string().required(),
	userId: Joi.string().required(),
})
