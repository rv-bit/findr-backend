import { Router } from 'express';
import * as controller from '../controllers/test.js'

const router = Router();

router.get('/', controller.test);

export default router;