import { Router, RequestHandler } from 'express'
import { validateRequest } from '#utils/index.js'
import { newPostSchema } from './schema.js'

import * as controller from '#controllers/post/index.js'
import { userHandler } from '../../middlewares.js'

const router = Router()

router.get('/', controller.getAllPosts)
router.post('/insert', userHandler() as RequestHandler, validateRequest(newPostSchema) as RequestHandler, controller.newTestPost)

export default router
