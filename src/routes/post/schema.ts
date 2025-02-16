import { JoiXss } from '#utils/utils.js'

export interface NewPostSchema {
	slug?: string
	title: string
	content: string
	userId: string
}

export const newPostSchema = JoiXss.object({
	slug: JoiXss.string(),
	title: JoiXss.string().required().xss(),
	content: JoiXss.string().required().xss(),
	userId: JoiXss.string().required(),
})
