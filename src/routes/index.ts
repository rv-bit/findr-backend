import { Router } from 'express';
const router = Router();

import testRouter from "./test/test.js";

router.use('/test', testRouter);

export default router;