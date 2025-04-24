import { Router, type RequestHandler } from 'express'
import { validateRequest } from '~/lib/index'

import * as controller from '~/controllers/user/index'
import { authHandler } from '~/middlewares'

const router = Router()

router.get('/:username', controller.getUserInfo)
router.get('/getData/:username', controller.getUserData)

export default router
