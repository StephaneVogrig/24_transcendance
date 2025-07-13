import Fastify from 'fastify';
import * as AI from './ai.js';
import cors from '@fastify/cors'

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

fastify.get('/api/ai', async (request, reply) => { 
  return { message: 'Hello from AI Service!' };
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
