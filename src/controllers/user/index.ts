import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/utils/index'

export const getUserInfo = handler(async (req: Request, res: Response) => {
	const { slug } = req.params

	const username = slug.replace(/-/g, ' ')

	const users = await db.select().from(schema.user).where(eq(schema.user.username, username)).limit(1)
	if (!users || users.length === 0) {
		res.status(200).json({
			data: null,
			message: 'User not found',
		})
		return
	}

	const userInfo = users[0]
	res.status(200).json({
		data: {
			id: userInfo.id,
			username: userInfo.username,
			image: userInfo.image,
			about_description: userInfo.about_description,
		},
	})
})
