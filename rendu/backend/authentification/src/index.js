import 'dotenv/config';
import Fastify from 'fastify';
import { saveUserToDatabase, getAllUserInfoInDB, getActiveUserInfoInDB, updateLogStatusInDatabase } from './userDatabase.js';
// import {  getUserFromDatabase } from './userDatabase.js';


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
fastify.post('/userRegistering', async (request, reply) => {
  const { user } = request.body;
  console.log('!!! User info received from Auth0:', user);

  //exemple de données utilisateur reçues
//   !!! User info received from Auth0: {
//   given_name: 'Gollum',
//   family_name: 'Smeagol',
//   nickname: '666.gollum',
//   name: 'Gollum Smeagol',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocIENaeZPVFX0lw6WoVma5HapN2nJpCsXYBW5EsJEh4q7_Kw6Ak=s96-c',
//   updated_at: '2025-08-11T17:14:25.421Z',
//   email: '666.gollum@gmail.com',
//   email_verified: true,
//   sub: 'google-oauth2|108259952350802037215'
// }
 
  if (!user) {
    return reply.status(400).send({ error: 'No user information provided' });
  }
  
  try // Mapping des données Auth0 vers notre format
  {
    const mappedUser = {
      sub: user.sub,
      email: user.email,
      nickname: user.nickname || 'Unknown',
      picture: user.picture,
      givenName: user.given_name || 'Unknown',
      familyName: user.family_name || 'Unknown',
      status: 'active', // Par défaut, l'utilisateur est actif
    };
    
    console.log('!!! Mapped user data:', mappedUser);
    
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



fastify.get('/getAllUserInfo', async (request, reply) => {
   try {
        const users = await getAllUserInfoInDB(); // appel du backend database
       
        if (!users || users.length === 0) {
            return reply.status(200).send([]);
        }
           
        reply.status(200).send(users); // Envoie la liste des utilisateurs
    }
    catch (error) {
        console.error('Erreur getAllUserInfo:', error);
        reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

fastify.get('/getActiveUserInfo', async (request, reply) => {
   try {
        const users = await getActiveUserInfoInDB(); // appel du backend database
       
        if (!users || users.length === 0) {
            return reply.status(200).send([]);
        }
           
        reply.status(200).send(users); // Envoie la liste des utilisateurs
    }
    catch (error) {
        console.error('Erreur getUserInfo:', error);
        reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

fastify.post('/LogStatus', async (request, reply) => {

  // const { user } = request.body;
  console.log('User info received for status update:', request.body);
  
  console.log('LogStatus request body:', request.body);

  let nickname, status;
  
  nickname = request.body.nickname;
  status = request.body.status;

  console.log('Extracted nickname:', nickname);
  console.log('Extracted status:', status);

  // if (!user || !user.nickname || !user.status)
  // {
  //   return reply.status(400).send({ error: 'User nickname and status are required' });
  // }

   console.log('Extracted data:', { nickname, status });

    if (!nickname || !status) 
    {
        return reply.status(400).send({ 
            error: 'User nickname and status are required',
            received: request.body 
        });
    }
    
  // const updated = await updateLogStatusInDatabase(user);
  try 
  {
        const userUpdate = { nickname, status };
        const result = await updateLogStatusInDatabase(userUpdate);
        
        return reply.status(200).send({ 
            message: 'User status updated successfully',
            result 
        });
    } 
    catch (error) {
        console.error('Error updating user status:', error);
        return reply.status(500).send({ 
            error: 'Failed to update user status',
            details: error.message 
        });
    }
});

const start = async () => {
  try 
  {
    await fastify.listen({ port: serviceport, host: '0.0.0.0' });
  } 
  catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
