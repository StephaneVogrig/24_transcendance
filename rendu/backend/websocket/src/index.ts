import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

const clientOrigin = `http://localhost:5173`;
fastify.register(cors, {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true
});

const io = new Server(fastify.server, {
    cors: {
        origin: clientOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/my-websocket/'
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.emit('message', 'Hello from Socket.IO server!');


    socket.on('message', (data) => {
        console.log(`Message from client ${socket.id}:`, data);
        io.emit('message', `Server received: ${data}`);
    });

    socket.on('keydown', (data) => {
        console.log(`Key down from client ${socket.id}:`, data);
        io.emit('message', `Key pressed: ${data.key}`);
    });

    socket.on('keyup', (data) => {
        console.log(`Key up from client ${socket.id}:`, data);
        io.emit('message', `Key released: ${data.key}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3008, host: '0.0.0.0' });
        console.log(`Fastify and Socket.IO server listening on port 3008`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
