import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ 
  logger: true 
});

// Configuration CORS pour permettre les requêtes depuis le frontend
await fastify.register(cors, {
  origin: ['http://localhost:5173'], // Port Vite par défaut
  credentials: true
});

// Route de base pour tester que le gateway fonctionne
fastify.get('/', async (request, reply) => {
  return { 
    message: 'Gateway Transcendence - Prêt pour le Pong !',
    timestamp: new Date().toISOString(),
    status: 'running'
  };
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

// Démarrage du serveur
const start = async (): Promise<void> => {
  try {
    await fastify.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });
    console.log('🚀 Gateway démarré sur http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();