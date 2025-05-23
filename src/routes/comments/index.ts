import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/lib/index'

import * as controller from '~/controllers/comments/index'
import { authHandler } from '~/middlewares'

import { getCommentsSchema, newCommentSchema, newCommentReplySchema } from './schema'

const router = Router()

router.get('/:postId', validateRequest(getCommentsSchema) as RequestHandler, controller.getCommentsByPost)
router.get('/replies/:commentId', validateRequest(getCommentsSchema) as RequestHandler, controller.getRepliesByComment)

router.get('/comment/:commentId', validateRequest(getCommentsSchema) as RequestHandler, controller.getParentCommentByComment)

router.post('/insert', authHandler() as RequestHandler, validateRequest(newCommentSchema) as RequestHandler, controller.createComment)
router.post('/insertReply', authHandler() as RequestHandler, validateRequest(newCommentReplySchema) as RequestHandler, controller.createReply)

router.post('/upvote/:commentId', authHandler() as RequestHandler, controller.upvoteComment)
router.post('/downvote/:commentId', authHandler() as RequestHandler, controller.downvoteComment)

export default router
