import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/utils/index'

import * as controller from '~/controllers/post/index'
import { authHandler } from '~/middlewares'

import { insertPostLikeSchema, newPostSchema } from './schema'

const router = Router()

router.get('/', controller.getAllPosts)
router.post('/insert', authHandler() as RequestHandler, validateRequest(newPostSchema) as RequestHandler, controller.newTestPost)
router.post('/like/:postId', authHandler() as RequestHandler, validateRequest(insertPostLikeSchema) as RequestHandler, controller.likePost)

router.get('/read', controller.testGetAllPosts)
router.get('/write', controller.testWritePosts)

export default router
