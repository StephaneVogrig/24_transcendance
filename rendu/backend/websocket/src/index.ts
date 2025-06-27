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

async function sendToGameLogic(socketId, key, action) {
    try {
        const response = await fetch('http://0.0.0.0:3004/api/game/input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                socketId: socketId,
                key: key,
                action: action,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send to game logic:', response.status);
        }
    } catch (error) {
        console.error('Error communicating with game logic service:', error);
    }
}

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
        await sendToGameLogic(socket.id, data.key, 'keydown');
    });

    socket.on('keyup', (data) => {
        console.log(`Key up from client ${socket.id}:`, data);
        io.emit('message', `Key released: ${data.key}`);
	await sendToGameLogic(socket.id, data.key, 'keyup');
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
