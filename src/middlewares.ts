import { auth } from '#utils/auth.js'
import { fromNodeHeaders } from 'better-auth/node'
import { Request, Response, NextFunction } from 'express'

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

export const userHandler = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

		console.log('session', session)

		if (!session) {
			return res.status(400).json({
				error: 'No session found',
			})
		}

		req.body = {
			...req.body,
			userId: session.user.id,
		}
		next()
	}
}
