import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/scores', async (request, reply) => { 
  return { message: 'Hello from Scores Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3006, host: '0.0.0.0' });
    console.log(`Scores service listening on port 3006`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
