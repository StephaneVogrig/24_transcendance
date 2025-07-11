import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';


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
  logger: true 
});

await fastify.register(cors, {
  origin: [
    FRONTEND_ORIGIN,
    'http://localhost:5173'
  ],
  credentials: true
});

// Route API de base
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'healthy',
    service: 'gateway',
    uptime: process.uptime()
  };
});

// Route pour obtenir des informations sur le jeu (pour plus tard)
fastify.get('/api/game/info', async (request, reply) => {
  return {
    name: 'Transcendence Pong',
    version: '1.0.0',
    players: 0, // Sera dynamique plus tard
    activeGames: 0
  };
});

// Proxy pour les services

fastify.register(proxy, {
  upstream: AUTH_SERVICE_BASE_URL,
  prefix: '/api/auth'
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
      port: 3000, 
      host: '0.0.0.0' 
    });
    console.log('🚀 Gateway démarré sur http://localhost:3000');
    console.log(`CORS autorisé pour l'origine frontend : ${FRONTEND_ORIGIN}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
