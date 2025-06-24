import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';

const fastify = Fastify({ 
  logger: true 
});

// Enregistrement du plugin @fastify/http-proxy
// Les URL des microservices devraient idéalement provenir de variables d'environnement
const AUTH_SERVICE_BASE_URL = 'http://localhost:3001'; // Remplacez par l'URL de votre service d'authentification
// // const TOURNAMENT_SERVICE_BASE_URL = 'http://localhost:3002'; // Remplacez par l'URL de votre service de tournoi


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

// Implémentation du routage dynamique avec @fastify/http-proxy

// Proxy pour le service d'authentification
// Toutes les requêtes vers /api/auth/* seront redirigées vers AUTH_SERVICE_BASE_URL
fastify.register(proxy, {
  upstream: AUTH_SERVICE_BASE_URL,
  prefix: '/api/auth', // Chemin d'API pour le service d'authentification
  rewritePrefix: '/api/auth', // Réécrit l'URL pour le service cible si nécessaire, ici on garde le même chemin
  http2: false // Définissez à true si votre service cible utilise HTTP/2
});

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
