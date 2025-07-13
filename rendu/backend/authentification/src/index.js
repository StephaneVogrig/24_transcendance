import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { saveUserToDatabase, getUserFromDatabase } from './userDatabase.js';


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

// Route pour vérifier le statut d'authentification
fastify.get('/api/auth/status', async (request, reply) => {
  return { message: 'Authentication service is running', timestamp: new Date().toISOString() };
});

// Route pour recevoir les informations utilisateur d'Auth0
fastify.post('/api/auth/user', async (request, reply) => {
  const { user } = request.body;
  console.log('User info received from Auth0:', user);
  
  if (!user) {
    return reply.status(400).send({ error: 'No user information provided' });
  }
  
  try {
    // Sauvegarder l'utilisateur en base de données
    const savedUser = await saveUserToDatabase(user);
    console.log('User saved to database:', savedUser);
    
    return reply.status(200).send({ 
      message: 'User information processed and saved successfully',
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        picture: savedUser.picture,
        auth0_id: savedUser.auth0_id,
        provider: savedUser.provider,
        created_at: savedUser.created_at,
        updated_at: savedUser.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error processing user information:', error);
    return reply.status(500).send({ 
      error: 'Failed to save user information',
      details: error.message 
    });
  }
});

// Route pour récupérer un utilisateur par Auth0 ID
fastify.get('/api/auth/user/:auth0_id', async (request, reply) => {
  const { auth0_id } = request.params;
  
  if (!auth0_id) {
    return reply.status(400).send({ error: 'Auth0 ID is required' });
  }
  
  try {
    const user = await getUserFromDatabase(auth0_id);
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    return reply.status(200).send({ 
      message: 'User found',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        auth0_id: user.auth0_id,
        provider: user.provider,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return reply.status(500).send({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
});


start();
