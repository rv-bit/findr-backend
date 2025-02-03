import { Router } from 'express'
const router = Router()

import postsRouter from '~/routes/post/index'

router.use('/post', postsRouter)

export default router
