import { JoiXss } from '~/lib/utils'

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
