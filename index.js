const express = require('express');
const app = express();

const server = require('http').Server(app);
const db = require('./services/database');

const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const testRouter = require('./routes/test');

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
});