import Fastify from 'fastify';
import * as AI from './ai.js';

const serviceName = 'ai';
const serviceport = 3009;

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
    await fastify.listen({ port: 3009, host: '0.0.0.0' });
    console.log(`AI service listening on port 3009`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.post('/api/ai/create', async (request, reply) => {
	if (!request.body || typeof request.body.name !== 'string')
		return reply.status(400).send({ error: 'Missing or invalid name.' });
	const name = request.body.name;
	if (!name)
		return reply.status(400).send({ error: 'Name is undefined.' });
	try
	{
		await AI.createAI(name);
		reply.status(200).send(`Created AI game with ${name}.`);
	} catch (err) {
		reply.status(400).send(`Couldn't create AI game with ${name}: ${err.message}`);
	}
});

start();
