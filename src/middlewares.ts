import { auth } from '~/lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request, Response, NextFunction } from 'express'

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
	const message = `Not Found - ${req.originalUrl}`
	res.status(404)
	res.json({ message })
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	const statusCode = res.statusCode !== 200 ? res.statusCode : 500
	res.status(statusCode)

	const responseBody = {
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
	}

	console.error(err)
	res.json(responseBody)
}

export const authHandler = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

		if (!session || !session.user) {
			return res.status(401).json({
				error: 'Unauthorized',
			})
		}

		req.body = {
			...req.body,
			userId: session.user.id,
		}
		next()
	}
}
