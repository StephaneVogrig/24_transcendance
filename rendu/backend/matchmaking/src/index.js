import { fastify, log } from '../shared/fastify.js';
import * as PlayerManager from './playerManager.js';

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
