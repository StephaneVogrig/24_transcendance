import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const fastify = Fastify({ logger: true });

// Configuration CORS
fastify.register(cors, {
  origin: true,
  credentials: true
});

// Configuration JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production'
});

// Configuration OAuth2 Auth0
fastify.register(oauth2, {
  name: 'auth0',
  scope: ['openid', 'profile', 'email'],
  credentials: {
    client: {
      id: process.env.AUTH0_CLIENT_ID!,
      secret: process.env.AUTH0_CLIENT_SECRET!
    },
    auth: oauth2.AUTHORIZATION_CODE,
    options: {
      authorizationURL: `https://${process.env.AUTH0_DOMAIN}/authorize`,
      tokenURL: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      revocationURL: `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    }
  },
  startRedirectPath: '/auth/auth0',
  callbackURI: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3001/auth/auth0/callback'
});

// Middleware d'authentification
const authenticate = async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
};

// Routes d'authentification
fastify.get('/auth/auth0', async (request, reply) => {
  try {
    const redirectUrl = await fastify.auth0.getAuthorizationUrl(request);
    reply.redirect(redirectUrl);
  } catch (err) {
    reply.status(500).send({ error: 'Erreur lors de la redirection Auth0' });
  }
});

fastify.get('/auth/auth0/callback', async (request, reply) => {
  try {
    const token = await fastify.auth0.getAccessTokenFromAuthorizationCodeFlow(request);
    
    // Récupérer les informations utilisateur depuis Auth0
    const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const userInfo = userInfoResponse.data;
    
    // Créer un JWT pour notre application
    const appToken = fastify.jwt.sign({
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    });

    // Rediriger vers le frontend avec le token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:1800';
    reply.redirect(`${frontendUrl}/auth/callback?token=${appToken}`);
  } catch (err) {
    console.error('Erreur callback Auth0:', err);
    reply.status(500).send({ error: 'Erreur lors du callback Auth0' });
  }
});

// Route pour vérifier le token
fastify.get('/auth/verify', { preHandler: authenticate }, async (request, reply) => {
  return { valid: true, user: request.user };
});

// Route de logout
fastify.post('/auth/logout', async (request, reply) => {
  const returnTo = encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:1800');
  const logoutUrl = `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;
  
  return { logoutUrl };
});

// Route de base
fastify.get('/api/auth', async (request, reply) => { 
  return { message: 'Authentication Service with OAuth2 ready!' };
});

// Route pour obtenir les informations utilisateur
fastify.get('/auth/user', { preHandler: authenticate }, async (request, reply) => {
  return { user: request.user };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`🔐 Authentication service with OAuth2 listening on port 3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
