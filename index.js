import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';

import db from './services/database.js';

import testRouter from './routes/test.js';

const app = express();
const server = http.Server(app);

const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "docker") {
    app.use(cors({ origin: 'https://sunriseseniorservices.fun' }));
    app.use(express.static(path.join(__dirname, '../dist')));
} else {
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))
}

app.use('/test', testRouter);

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);

    console.log('Database connection established', db);
});