import type { Context, Next } from 'hono'

type Handler = (fn: (c: Context) => Promise<void> | void) => (c: Context, next: Next) => Promise<void> | void

export const handler: Handler = (fn) => async (c: Context, next: Next) => {
	try {
		await fn(c)
	} catch (error) {
		next()
	}
}
