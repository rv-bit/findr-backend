import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import path from 'path';

import { toNodeHandler, fromNodeHeaders } from "better-auth/node"; // Better Auth handler
import { auth } from "./utils/index.js";  // Your auth config
import routes from './routes/index.js';  // Your other routes

const app = express();

const corsOptions = {
    origin: process.env.BETTER_TRUSTED_ORIGINS?.split(","),
    credentials: true,  // This ensures that cookies/credentials are allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Ensure necessary headers are allowed
};

app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "docker") {
    app.use(express.static(path.join(__dirname, '../dist')));
}

app.use('/api/v1', express.json(), routes);
app.get("/api/auth/use-session", async (req: express.Request, res: express.Response): Promise<void> => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    res.json(session);
});

app.all("/api/auth/*", toNodeHandler(auth));

app.use((req, res, next) => {
    res.status(404).send('Not Found');
    next();
});

export default app;
