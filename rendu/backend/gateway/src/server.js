import Fastify from 'fastify';
import proxy from '@fastify/http-proxy';
import staticPlugin from '@fastify/static';

const serviceName = 'gateway';
const serviceport = 3000;

/* https server ********************************************************/

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

/* cors protection ****************************************************/

import cors from '@fastify/cors';
const HOST_IP = process.env.HOST_IP;
const HOST_ADDRESS = `https://${HOST_IP}:3000`;
await fastify.register(cors, {
  origin: HOST_ADDRESS,
  methods: ['GET', 'POST'],
  credentials: true
});

/*  ********************************************************************/

const AUTH_SERVICE_BASE_URL = 'http://authentification:3001';
const BLOCKCHAIN_SERVICE_BASE_URL = 'http://blockchain:3002';
const DATABASE_SERVICE_BASE_URL = 'http://database:3003';
const GAME_SERVICE_BASE_URL = 'http://game:3004';
const MATCHMAKING_SERVICE_BASE_URL = 'http://matchmaking:3005';
const SCORES_SERVICE_BASE_URL = 'http://scores:3006';
const TOURNAMENT_SERVICE_BASE_URL = 'http://tournament:3007';
const WEBSOCKET_SERVICE_BASE_URL = 'http://websocket:3008';
const AI_SERVICE_BASE_URL = 'http://ai:3009';

// API endpoint to check the availability and operational status of the service.
fastify.get('/api/gateway/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

// Proxy for services
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

// Static to serve frontend files
await fastify.register(staticPlugin, {
  root: '/app/public',
  prefix: '/',
  decorateReply: false,
  setHeaders: (res, path, stat) => {
    // Headers CORS pour les fichiers statiques
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
});

// Handler pour les routes SPA - doit être après l'enregistrement du plugin static
fastify.setNotFoundHandler(async (request, reply) => {
  const url = request.url;
  
  // Si c'est une route API ou websocket, retourner 404
  if (url.startsWith('/api/') || url.startsWith('/my-websocket/')) {
    return reply.code(404).send({ error: 'Not Found' });
  }
  
  // Pour toutes les autres routes (y compris /auth/callback), servir index.html (SPA routing)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const indexPath = path.join('/app/public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      return reply
        .type('text/html')
        .header('Cross-Origin-Embedder-Policy', 'unsafe-none')
        .header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
        .send(indexContent);
    } else {
      return reply.code(404).send({ error: 'Index file not found' });
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ 
      port: serviceport,
      host: '0.0.0.0' 
    });
    console.log(serviceName, `service listening on port`, serviceport);
    // console.log(`CORS autorisé pour l'origine : ${HOST_ADDRESS}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
