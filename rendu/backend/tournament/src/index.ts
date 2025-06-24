import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/tournament', async (request, reply) => { 
  return { message: 'Hello from Tournament Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3007, host: '0.0.0.0' });
    console.log(`Tournament service listening on port 3007`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
