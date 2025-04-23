import { JoiXss } from '~/utils/utils'

export interface NewPostSchema {
	slug: string
	title: string
	content: string
	userId: string
}

export const newPostSchema = JoiXss.object({
	slug: JoiXss.string().required().xss(),
	title: JoiXss.string().required().xss(),
	content: JoiXss.string().required().xss(),
	userId: JoiXss.string().required(),
})

export const insertPostLikeSchema = JoiXss.object({
	postId: JoiXss.string().required().xss(),
	userId: JoiXss.string().required().xss(),
})
