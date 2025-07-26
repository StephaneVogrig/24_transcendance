import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';

const serviceName = 'gateway';
const serviceport = 3000;

const HOST_IP = process.env.HOST_IP;
const FRONTEND_ORIGIN = `http://${HOST_IP}:5173`;

const AUTH_SERVICE_BASE_URL = 'http://authentification:3001';
const BLOCKCHAIN_SERVICE_BASE_URL = 'http://blockchain:3002';
const DATABASE_SERVICE_BASE_URL = 'http://database:3003';
const GAME_SERVICE_BASE_URL = 'http://game:3004';
const MATCHMAKING_SERVICE_BASE_URL = 'http://matchmaking:3005';
const SCORES_SERVICE_BASE_URL = 'http://scores:3006';
const TOURNAMENT_SERVICE_BASE_URL = 'http://tournament:3007';
const WEBSOCKET_SERVICE_BASE_URL = 'http://websocket:3008';
const AI_SERVICE_BASE_URL = 'http://ai:3009';

const fastify = Fastify({ 
    logger: true,
    // https: {
    //     key: '/app/ssl/key.pem',
    //     cert: '/app/ssl/cert.pem',
    // }
});

await fastify.register(cors, {
  origin: [
    FRONTEND_ORIGIN,
    'http://localhost:5173'
  ],
  credentials: true
});

// API endpoint to check the availability and operational status of the service.
fastify.get('/api/gateway/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

// Proxy pour les services
fastify.register(proxy, {
  upstream: AUTH_SERVICE_BASE_URL,
  prefix: '/api/authentification'
});

fastify.register(proxy, {
  upstream: BLOCKCHAIN_SERVICE_BASE_URL,
  prefix: '/api/blockchain'
});

fastify.register(proxy, {
  upstream: DATABASE_SERVICE_BASE_URL,
  prefix: '/api/database'
});

fastify.register(proxy, {
  upstream: GAME_SERVICE_BASE_URL,
  prefix: '/api/game'
});

fastify.register(proxy, {
  upstream: MATCHMAKING_SERVICE_BASE_URL,
  prefix: '/api/matchmaking'
});

fastify.register(proxy, {
  upstream: SCORES_SERVICE_BASE_URL,
  prefix: '/api/scores'
});

fastify.register(proxy, {
  upstream: TOURNAMENT_SERVICE_BASE_URL,
  prefix: '/api/tournament'
});

fastify.register(proxy, {
  upstream: WEBSOCKET_SERVICE_BASE_URL,
  prefix: '/api/websocket',
  websocket: true
});

fastify.register(proxy, {
  upstream: AI_SERVICE_BASE_URL,
  prefix: '/api/ai',
});

const start = async () => {
  try {
    await fastify.listen({ 
      port: serviceport,
      host: '0.0.0.0' 
    });
    console.log(serviceName, `service listening on port`, serviceport);
    console.log(`CORS autorisé pour l'origine : ${FRONTEND_ORIGIN}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
