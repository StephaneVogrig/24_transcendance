import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/blockchain', async (request, reply) => {
  return { message: 'Hello from Blockchain Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log(`Blockchain service listening on port 3002`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
