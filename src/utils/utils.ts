import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validateRequest = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                error: result.error.details[0].message,
            });
        }

        // Replace req.body with the data after validation
        if (!req.body) {
            req.body = {};
        }
        req.body = result.value;
        next();
    };
};