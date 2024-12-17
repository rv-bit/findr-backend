import { Request, Response } from 'express'
import { handler, userMiddleware } from '../utils/index.js'

const testRoute = async (req: Request, res: Response): Promise<void> => {
	const { user, session } = await userMiddleware(req)

	if (!user) {
		res.status(401).json({
			message: 'Unauthorized',
		})
		return
	}

	res.status(200).json({
		message: 'Hello World!',
	})
}

export const test = handler(testRoute)
