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

// fonction pour  recuperer le token
fastify.post('/api/auth', async (request, reply) => {
  const { tocken_code } = request.body;
  console.log(`Received tocken: ${tocken_code}`);
  
  if (!tocken_code) {
    console.log(`No tocken_code received`);
    return reply.status(400).send({ error: 'No tocken_code received' });
  }
  
  console.log(`Processing tocken: ${tocken_code}`);
  
  // TODO: Traiter le token (validation, échange contre un JWT, etc.)
  
  // Renvoyer une réponse positive
  return reply.status(200).send({ 
    message: 'Token received successfully',
    token: tocken_code 
  });
  
});


start();
