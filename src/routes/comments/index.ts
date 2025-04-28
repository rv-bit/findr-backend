import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/lib/index'

import * as controller from '~/controllers/comments/index'
import { authHandler } from '~/middlewares'

import { getCommentsSchema } from './schema'

const router = Router()

router.get('/:postId', validateRequest(getCommentsSchema) as RequestHandler, controller.getCommentsByPost)
router.get('/replies/:commentId', validateRequest(getCommentsSchema) as RequestHandler, controller.getRepliesByComment)

export default router
