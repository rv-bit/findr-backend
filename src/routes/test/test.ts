import { Router, RequestHandler } from 'express';
import { validateRequest } from '../../utils/utils.js';
import { testSchema } from './schema.js';

import * as controller from '../../controllers/test.js'

const router = Router();

router.get('/', controller.test);
router.post(
    '/insert',
    validateRequest(testSchema) as RequestHandler,
    controller.testPost
);

export default router;