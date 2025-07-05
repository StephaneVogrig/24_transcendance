import Fastify from 'fastify';
import * as AI from './ai.js';

const fastify = Fastify({ logger: true });

fastify.get('/api/ai', async (request, reply) => { 
  return { message: 'Hello from AI Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3009, host: '0.0.0.0' });
    console.log(`AI service listening on port 3006`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
