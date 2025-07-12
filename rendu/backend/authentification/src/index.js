import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ManageTockenGetName, ManageTockenGetEmail, ManageTockenGetUserInfo } from './ManageTocken.js';
import { exchangeCodeForToken } from './OAuthExchange.js';


const fastify = Fastify({ logger: true });


const HOST_IP = process.env.HOST_IP;
fastify.register(cors, {
   origin: [
       `http://${HOST_IP}:5173`,
       'http://localhost:5173'
   ],
   methods: ['GET', 'POST'],
   credentials: true
});



fastify.get('/api/auth', async (request, reply) => { 
  return { message: 'Hello from Authentification Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Authentification service listening on port 3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// fonction pour  recuperer le token
fastify.post('/api/auth', async (request, reply) => {
  const { tocken_code } = request.body;
  console.log(`Received authorization code: ${tocken_code}`);
  
  if (!tocken_code) {
    console.log(`No authorization code received`);
    return reply.status(400).send({ error: 'No authorization code received' });
  }
  
  try {
    console.log(`Exchanging authorization code for access token...`);
    
    // Étape 1: Échanger le code d'autorisation contre un access token
    const accessToken = await exchangeCodeForToken(tocken_code);
    console.log(`Access token obtained: ${accessToken.substring(0, 10)}...`);
    
    // Étape 2: Récupérer les informations utilisateur avec l'access token
    const userInfo = await ManageTockenGetUserInfo(accessToken);
    console.log(`User info retrieved:`, userInfo);
    
    // Renvoyer une réponse positive avec les informations utilisateur
    return reply.status(200).send({ 
      message: 'Authentication successful',
      authorization_code: tocken_code,
      user: userInfo
    });
    
  } catch (error) {
    console.error('Error during authentication process:', error);
    return reply.status(401).send({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});


start();
