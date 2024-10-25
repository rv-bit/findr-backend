import { Request, RequestHandler, Response } from 'express';

type Handler = (
    fn: (req: Request, res: Response) => Promise<void> | void
) => RequestHandler;

export const handler: Handler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res);
    } catch (error) {
        next(error);
    }
};