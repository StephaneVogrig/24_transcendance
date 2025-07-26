import Fastify from 'fastify';
import * as AI from './ai.js';
import { addAI } from './iaManager.js';

const serviceName = 'ai';
const serviceport = 3009;

const fastify = Fastify({ logger: true });

// API endpoint to check the availability and operational status of the service.
fastify.get('/health', async (request, reply) => {
  return {
	service: serviceName,
	port: serviceport,
	status: 'healthy',
	uptime: process.uptime()
  };
});

const start = async () => {
  try {
	await fastify.listen({ port: serviceport, host: '0.0.0.0' });
	console.log(serviceName, `service listening on port`, serviceport);
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
};

fastify.post('/create', async (request, reply) => {
  if (!request.body || typeof request.body.name !== 'string')
	return reply.status(400).send({ error: 'Missing or invalid name.' });
  const name = request.body.name;
  if (!name)
	return reply.status(400).send({ error: 'Name is undefined.' });
  try
  {
	await addAI(name);
	reply.status(200).send(`Created AI game with ${name}.`);
  } catch (err) {
	reply.status(400).send(`Couldn't create AI game with ${name}: ${err.message}`);
  }
});

start();
