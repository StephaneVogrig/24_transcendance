import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

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

start();
