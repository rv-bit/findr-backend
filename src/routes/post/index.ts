import { Hono } from 'hono'
// import { validateRequest } from '~/utils/index'

// import { authHandler } from '~/middlewares'

// import { newPostSchema } from './schema'
// import * as controller from '~/controllers/post/index'

const router = new Hono()

// router.get('/', controller.getAllPosts)
// router.post('/insert', authHandler() as RequestHandler, validateRequest(newPostSchema) as RequestHandler, controller.newTestPost)

export default router
