import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';

const fastify = Fastify({ 
  logger: true 
});

const AUTH_SERVICE_BASE_URL = 'http://authentification:3001';
const BLOCKCHAIN_SERVICE_BASE_URL = 'http://blockchain:3002';
const DATABASE_SERVICE_BASE_URL = 'http://database:3003';
const GAME_SERVICE_BASE_URL = 'http://game:3004';
const MATCHMAKING_SERVICE_BASE_URL = 'http://matchmaking:3005';
const SCORES_SERVICE_BASE_URL = 'http://scores:3006';
const TOURNAMENT_SERVICE_BASE_URL = 'http://tournament:3007';
const WEBSOCKET_SERVICE_BASE_URL = 'http://websocket:3008';

// Configuration CORS
fastify.register(cors, {
  origin: ['https://localhost:8443', 'http://localhost:8080', 'http://localhost:5173'],
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

const start = async (): Promise<void> => {
  try {
    // Enregistrer les proxies pour les services
    await fastify.register(proxy, {
      upstream: AUTH_SERVICE_BASE_URL,
      prefix: '/api/auth'
    });

    await fastify.register(proxy, {
      upstream: BLOCKCHAIN_SERVICE_BASE_URL,
      prefix: '/api/blockchain'
    });

    await fastify.register(proxy, {
      upstream: DATABASE_SERVICE_BASE_URL,
      prefix: '/api/database'
    });

    await fastify.register(proxy, {
      upstream: GAME_SERVICE_BASE_URL,
      prefix: '/api/game'
    });

    await fastify.register(proxy, {
      upstream: MATCHMAKING_SERVICE_BASE_URL,
      prefix: '/api/matchmaking'
    });

    await fastify.register(proxy, {
      upstream: SCORES_SERVICE_BASE_URL,
      prefix: '/api/scores'
    });

    await fastify.register(proxy, {
      upstream: TOURNAMENT_SERVICE_BASE_URL,
      prefix: '/api/tournament'
    });

    await fastify.register(proxy, {
      upstream: WEBSOCKET_SERVICE_BASE_URL,
      prefix: '/api/websocket',
      websocket: true
    });

    await fastify.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });
    console.log('🚀 Gateway démarré sur http://localhost:3000');
    console.log('📋 Proxies configurés:');
    console.log('  - /api/auth -> ' + AUTH_SERVICE_BASE_URL);
    console.log('  - /api/blockchain -> ' + BLOCKCHAIN_SERVICE_BASE_URL);
    console.log('  - /api/database -> ' + DATABASE_SERVICE_BASE_URL);
    console.log('  - /api/game -> ' + GAME_SERVICE_BASE_URL);
    console.log('  - /api/matchmaking -> ' + MATCHMAKING_SERVICE_BASE_URL);
    console.log('  - /api/scores -> ' + SCORES_SERVICE_BASE_URL);
    console.log('  - /api/tournament -> ' + TOURNAMENT_SERVICE_BASE_URL);
    console.log('  - /api/websocket -> ' + WEBSOCKET_SERVICE_BASE_URL);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
