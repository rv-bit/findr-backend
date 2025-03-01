import type { Context, Next } from 'hono'
import { auth } from '~/utils/auth'

// import { fromNodeHeaders } from 'better-auth/node'
// import type { Request, Response, NextFunction } from 'express'

// export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
// 	const message = `Not Found - ${req.originalUrl}`
// 	res.status(404)
// 	res.json({ message })
// }

// export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
// 	const statusCode = res.statusCode !== 200 ? res.statusCode : 500
// 	res.status(statusCode)

// 	const responseBody = {
// 		message: err.message,
// 		stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
// 	}

// 	console.error(err)
// 	res.json(responseBody)
// }

export const authHandler = () => {
	return async (c: Context, next: Next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers as Headers })

		if (!session || !session.user) {
			return c.json({ message: 'Unauthorized' }, { status: 200 })
		}

		c.set('userId', session.user)
		next()
	}
}
