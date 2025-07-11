import Fastify from 'fastify';
import * as PlayerManager from './playerManager.js';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

const HOST_IP = process.env.HOST_IP;
fastify.register(cors, {
    origin: [
        `http://${HOST_IP}:5173`,
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
});

fastify.get('/api/matchmaking', async (request, reply) => { 
  return { message: 'Hello from Matchmaking Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3005, host: '0.0.0.0' });
    console.log(`Matchmaking service listening on port 3005`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.post('/api/matchmaking/join', async (request, reply) => {
  const { name } = request.body;
  console.log(`Received request to join with name: ${name}`);
  if (!name) {
    return reply.status(400).send({ error: 'Player name is required and must be a string' });
  }
  if (name.length < 3 || name.length > 20)
    return reply.status(400).send({ error: 'Player name must be between 3 and 20 characters' });
  try {
    PlayerManager.addPlayer(name);
    return { message: 'Player added successfully' };
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
});

fastify.post('/api/matchmaking/leave', async (request, reply) => {
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

start();
