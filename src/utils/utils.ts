import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";
import xss from 'xss';

const xssOptions = {
    whiteList: {}, // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ['script'], // the script tag is a special case, we need to filter out its content
}

// Create a custom Joi extension to sanitize strings
export const JoiXss = Joi.extend((joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.xss': '{{#label}} contains disallowed HTML content!',
    },
    rules: {
        xss: {
            validate(value, helpers) {
                const clean = xss(value, xssOptions);
                if (clean !== value) {
                    return helpers.error('string.xss', { value });
                }
                return clean;
            },
        },
    },
}));

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