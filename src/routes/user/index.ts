import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/utils/index'

import * as controller from '~/controllers/user/index'
import { authHandler } from '~/middlewares'

const router = Router()

router.get('/:username', controller.getUserInfo)
router.get('/getData/:userId', controller.getUserData)

export default router
