import 'dotenv/config';
import Fastify from 'fastify';
import { saveUserToDatabase, getUserFromDatabase } from './userDatabase.js';

const serviceName = 'authentification';
const serviceport = process.env.PORT;

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        singleLine: true,
        ignore: 'pid,hostname'
      }
    }
  },
});

// API endpoint to check the availability and operational status of the service.
fastify.get('/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

// Route pour vérifier le statut d'authentification
fastify.get('/status', async (request, reply) => {
  return { message: 'Authentication service is running', timestamp: new Date().toISOString() };
});

// Route pour recevoir les informations utilisateur d'Auth0
fastify.post('/user', async (request, reply) => {
  const { user } = request.body;
  console.log('User info received from Auth0:', user);
  
  if (!user) {
    return reply.status(400).send({ error: 'No user information provided' });
  }
  
  try {
    // Mapping des données Auth0 vers notre format
    const mappedUser = {
      sub: user.sub,
      email: user.email,
      nickname: user.nickname || user.name || user.given_name || 'Unknown',
      picture: user.picture
    };
    
    console.log('Mapped user data:', mappedUser);
    
    // Sauvegarder l'utilisateur en base de données
    const savedUser = await saveUserToDatabase(mappedUser);
    console.log('User saved to database:', savedUser);
    
    return reply.status(200).send({ 
      message: 'User information processed and saved successfully',
      user: {
        id: savedUser.id,
        nickname: savedUser.nickname,
        email: savedUser.email,
        picture: savedUser.picture,
        provider_id: savedUser.provider_id,
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
fastify.get('/user/:auth0_id', async (request, reply) => {
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
        nickname: user.nickname,
        email: user.email,
        picture: user.picture,
        provider_id: user.provider_id,
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

const start = async () => {
  try {
    await fastify.listen({ port: serviceport, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
