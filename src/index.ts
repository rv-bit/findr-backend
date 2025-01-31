import { Server } from 'http';
import app from './app.js';

const server = new Server(app);
const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});