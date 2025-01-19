import { Request, Response } from 'express'
import { handler, userMiddleware } from '../utils/index.js'

export const test = handler(async (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Hello World!',
    });
});

export const testPost = handler(async (req: Request, res: Response) => {
    console.log('Request body:', req.body);

    res.status(200).json({
        message: 'Success',
    });
});
