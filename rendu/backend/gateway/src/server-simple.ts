import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ 
  logger: true 
});

// Configuration CORS
fastify.register(cors, {
  origin: ['https://localhost:8443', 'http://localhost:8080', 'http://localhost:5173'],
  credentials: true
});

// Route API de base pour tester la connectivité
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'healthy',
    service: 'gateway',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
});

// Route pour obtenir des informations sur le jeu
fastify.get('/api/game/info', async (request, reply) => {
  return {
    name: 'Transcendence Pong',
    version: '1.0.0',
    players: 0,
    activeGames: 0,
    status: 'standalone'
  };
});

// Route de test pour vérifier CORS
fastify.get('/api/test', async (request, reply) => {
  return {
    message: 'CORS test successful',
    origin: request.headers.origin,
    timestamp: new Date().toISOString()
  };
});

const start = async (): Promise<void> => {
  try {
    await fastify.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });
    console.log('🚀 Gateway simplifié démarré sur http://localhost:3000');
    console.log('📋 Routes disponibles:');
    console.log('  - GET /api/health');
    console.log('  - GET /api/game/info');
    console.log('  - GET /api/test');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
