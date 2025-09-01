import { fastify, log } from '../shared/fastify.js';
import proxy from '@fastify/http-proxy';
import { allowedRoutes } from './allowedRoutes.js';

const AUTH_SERVICE_BASE_URL = 'http://authentification:3001';
const BLOCKCHAIN_SERVICE_BASE_URL = 'http://blockchain:3002';
const DATABASE_SERVICE_BASE_URL = 'http://database:3003';
const GAME_SERVICE_BASE_URL = 'http://game:3004';
const MATCHMAKING_SERVICE_BASE_URL = 'http://matchmaking:3005';
const TOURNAMENT_SERVICE_BASE_URL = 'http://tournament:3007';
const WEBSOCKET_SERVICE_BASE_URL = 'http://websocket:3008';
const AI_SERVICE_BASE_URL = 'http://ai:3009';
const GATWEWAY_SERVICE_BASE_URL = 'http://gateway:3010';
const FRONTEND_SERVICE_BASE_URL = 'http://frontend:5173';

fastify.addHook('preHandler', (request, reply, done) => {
    log.debug(`Routes recue: ${request.url}`);
    if (request.url.startsWith('/api/')) {
        const isRouteAllowed = allowedRoutes.some(route => request.url.startsWith(route));
        if (!isRouteAllowed) {
            log.debug(`Routes refuse : ${request.url}`);
            return reply.code(404).send({ error: 'Not Found' });
        }
    }
    log.debug(`Routes accepte : ${request.url}`);
    done();
});

/* proxy **************************************************************/

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

fastify.register(proxy, {
    upstream: GATWEWAY_SERVICE_BASE_URL,
    prefix: '/api/gateway',
});

fastify.register(proxy, {
    upstream: FRONTEND_SERVICE_BASE_URL,
    prefix: '/vite-hmr',
    websocket: true,
    replyOptions: {
        rewriteRequestHeaders: (originalReq, headers) => {
            return {
                ...headers,
                'host': 'frontend:5173'
            };
        }
    }
});
