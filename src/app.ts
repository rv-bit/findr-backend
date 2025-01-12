import 'dotenv/config';
import express from 'express';

import helmet from "helmet";
import cors from 'cors';
import path from 'path';

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth, limiter } from "./utils/index.js";

import routes from './routes/index.js';
import * as middlewares from './middlewares.js';

const app = express();

const corsOptions = {
    origin: process.env.BETTER_TRUSTED_ORIGINS?.split(","),
    credentials: true,  // This ensures that cookies/credentials are allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Ensure necessary headers are allowed
};

app.set('trust proxy', 1); // Trust first proxy
app.use(cors(corsOptions));
app.use(helmet()); // Set necessary headers
app.use(limiter); // Apply rate limiting for all routes

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "docker") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '../dist')));
}

app.use('/api/v1', express.json(), routes);
app.all("/api/auth/*", toNodeHandler(auth));

app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

export default app;
