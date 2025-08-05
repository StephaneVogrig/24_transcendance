import { fastify, log } from './fastify.js';

fastify.get('/health', async (request, reply) => {
  return {
	service: process.env.SERVICE_NAME,
	port: process.env.PORT,
	status: 'healthy',
	uptime: process.uptime()
  };
});
