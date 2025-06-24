import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/websocket', async (request, reply) => { 
  return { message: 'Hello from Websocket Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3008, host: '0.0.0.0' });
    console.log(`Websocket service listening on port 3008`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
