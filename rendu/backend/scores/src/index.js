import Fastify from 'fastify';

const serviceName = 'scores';
const serviceport = 3006;

/* https server *****************************************************************************/

import fs from 'fs';
const cert = fs.readFileSync('/app/ssl/cert.pem', 'utf8');
const key = fs.readFileSync('/app/ssl/key.pem', 'utf8');

const fastify = Fastify({
    logger: true,
    https: {
        key: key,
        cert: cert,
    }
});

/* cors protection *****************************************************************************/

import cors from '@fastify/cors';
const HOST_IP = process.env.HOST_IP;
const HOST_ADDRESS = `https://${HOST_IP}:5173`;
await fastify.register(cors, {
  origin: [
  HOST_ADDRESS,
  'https://localhost:5173',
  ],
  methods: ['GET', 'POST'],
  credentials: true
});

/*  *****************************************************************************/

// API endpoint to check the availability and operational status of the service.
fastify.get('/api/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
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
