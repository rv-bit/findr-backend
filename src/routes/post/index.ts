import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/lib/index'

import * as controller from '~/controllers/post/index'
import { authHandler } from '~/middlewares'

import { newPostSchema } from './schema'

const router = Router()

router.get('/', controller.getAllPosts)
router.get('/:postId', controller.getPostById)

router.post('/insert', authHandler() as RequestHandler, validateRequest(newPostSchema) as RequestHandler, controller.insertPost)
router.post('/upvote/:postId', authHandler() as RequestHandler, controller.upvotePost)
router.post('/downvote/:postId', authHandler() as RequestHandler, controller.downvotePost)

router.delete('/:postId', authHandler() as RequestHandler, controller.deletePost)

// router.get('/read', controller.testGetAllPosts)
// router.get('/write', controller.testWritePosts)

export default router
