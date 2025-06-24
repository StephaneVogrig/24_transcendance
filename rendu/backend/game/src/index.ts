import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/game', async (request, reply) => { 
  return { message: 'Hello from Game Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3004, host: '0.0.0.0' });
    console.log(`Game service listening on port 3004`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
