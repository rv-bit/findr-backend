import Joi from 'joi'

export const getCommentsSchema = Joi.object({
	page: Joi.number().required(),
})
