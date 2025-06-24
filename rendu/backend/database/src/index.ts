import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/database', async (request, reply) => { 
  return { message: 'Hello from Database Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3003, host: '0.0.0.0' });
    console.log(`Database service listening on port 3003`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
