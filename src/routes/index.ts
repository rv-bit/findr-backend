import { Router } from 'express';
const router = Router();

import testRouter from "#routes/test/test.js";

router.use('/test', testRouter);

export default router;