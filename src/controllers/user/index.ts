import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'

import * as schema from '~/services/database/schema'
import db from '~/services/database/database'

import { handler } from '~/utils/index'

export const getUserInfo = handler(async (req: Request, res: Response) => {
	const { slug } = req.params

	const username = slug.replace(/-/g, ' ')

	const user = await db.select().from(schema.user).where(eq(schema.user.username, username)).limit(1).execute()

	if (!user) {
		res.status(401).json({
			message: 'Failed to get user',
		})
		return
	}

	const userInfo = user[0]

	res.status(200).json({
		data: {
			id: userInfo.id,
			username: userInfo.username,
			image: userInfo.image,
			about_description: userInfo.about_description,
		},
	})
})
