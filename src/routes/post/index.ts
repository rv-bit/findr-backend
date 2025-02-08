import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/utils/index'
import { newPostSchema } from './schema'

import * as controller from '~/controllers/post/index'
import { authHandler } from '~/middlewares'

const router = Router()

router.get('/', controller.getAllPosts)
router.post('/insert', authHandler() as RequestHandler, validateRequest(newPostSchema) as RequestHandler, controller.newTestPost)

export default router
