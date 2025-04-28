import { Router } from 'express'

const router = Router()

import postsRouter from '~/routes/post/index'
import commentsRouter from '~/routes/comments/index'
import userRouter from '~/routes/user/index'

router.use('/post', postsRouter)
router.use('/comments', commentsRouter)
router.use('/users', userRouter)

export default router
