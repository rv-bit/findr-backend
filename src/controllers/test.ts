import express from 'express';
import { handler } from '../utils/index.js';

export const test = handler(async (req: express.Request, res: express.Response) => {
    res.status(200).json({
        message: 'Hello World!',
    });
});

export const testPost = handler(async (req: express.Request, res: express.Response) => {
    console.log('Request body:', req.body);

    res.status(200).json({
        message: 'Success',
    });
});
