import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';


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

// Route pour recevoir les informations utilisateur d'Auth0 (optionnel)
fastify.post('/api/auth/user', async (request, reply) => {
  const { user } = request.body;
  console.log('User info received from Auth0:', user);
  
  if (!user) {
    return reply.status(400).send({ error: 'No user information provided' });
  }
  
  try {
    // Ici vous pouvez :
    // 1. Sauvegarder l'utilisateur en base de données
    // 2. Créer une session côté serveur
    // 3. Générer un JWT personnalisé
    // 4. Etc.
    
    return reply.status(200).send({ 
      message: 'User information processed successfully',
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
    
  } catch (error) {
    console.error('Error processing user information:', error);
    return reply.status(500).send({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});


start();
