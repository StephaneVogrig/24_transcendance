import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Définissez l'origine de votre application cliente.
// Si votre client s'exécute sur http://localhost:5173, utilisez cette valeur.
// Si votre client s'exécute sur une adresse IP spécifique (par exemple, 192.168.1.100:5173), utilisez-la.
const clientOrigin = `http://${window.location.hostname}:5173`; // À adapter selon l'adresse de votre client

fastify.register(cors, {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true
});

fastify.get('/api/websocket', async (request, reply) => {
    return { message: 'Hello from Websocket Service!' };
});

const io = new Server(fastify.server, {
    cors: {
        origin: clientOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.emit('message', 'Hello from Socket.IO server!');


    socket.on('message', (data) => {
        console.log(`Message from client ${socket.id}:`, data);
        socket.emit('message', `Server received: ${data}`);
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