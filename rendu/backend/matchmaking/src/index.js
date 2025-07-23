import Fastify from 'fastify';
import * as PlayerManager from './playerManager.js';

const serviceName = 'matchmaking';
const serviceport = 3005;

/* https server *****************************************************************************/

import fs from 'fs';
const cert = fs.readFileSync('/app/ssl/cert.pem', 'utf8');
const key = fs.readFileSync('/app/ssl/key.pem', 'utf8');

const fastify = Fastify({
    logger: true,
    https: {
        key: key,
        cert: cert,
    }
});

/* cors protection *****************************************************************************/

import cors from '@fastify/cors';
const HOST_IP = process.env.HOST_IP;
const HOST_ADDRESS = `https://${HOST_IP}:5173`;
await fastify.register(cors, {
	origin: [
	HOST_ADDRESS,
	'https://localhost:5173',
	],
	methods: ['GET', 'POST'],
	credentials: true
});

/*  *****************************************************************************/

// API endpoint to check the availability and operational status of the service.
fastify.get('/api/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
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
  if (name.length < 3 || name.length > 25)
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
