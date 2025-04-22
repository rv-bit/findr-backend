import { Router } from 'express'
const router = Router()

import postsRouter from '~/routes/post/index'
import userRouter from '~/routes/user/index'

router.use('/post', postsRouter)
router.use('/users', userRouter)

export default router
