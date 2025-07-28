import Fastify from 'fastify';
import * as PlayerManager from './playerManager.js';

const serviceName = 'matchmaking';
const serviceport = 3005;

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss.l',
                singleLine: true,
                ignore: 'pid,hostname'
            }
        }
    },
});

// API endpoint to check the availability and operational status of the service.
fastify.get('/health', async (request, reply) => {
    return {
        service: serviceName,
        port: serviceport,
        status: 'healthy',
        uptime: process.uptime()
    };
});

fastify.post('/join', async (request, reply) => {
    const { name } = request.body;
    console.log(`Received request to join with name: ${name}`);
    if (!name) {
        return reply.status(400).send({ error: 'Player name is required and must be a string' });
    }
    if (name.length < 3 || name.length > 25)
        return reply.status(400).send({ error: 'Player name must be between 3 and 20 characters' });
    try {
        PlayerManager.addPlayer(name);
        return { message: 'Player added successfully' };
    } catch (error) {
        reply.status(400).send({ error: error.message });
    }
});

fastify.post('/leave', async (request, reply) => {
    const { name } = request.body;
    console.log(`Received request to leave with name: ${name}`);
    if (!name) {
        return reply.status(400).send({ error: 'Player name is required' });
    }
    try {
        PlayerManager.removePlayer(name);
        return { message: 'Player removed successfully' };
    } catch (error) {
        reply.status(400).send({ error: error.message });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: serviceport, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
