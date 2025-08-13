import 'dotenv/config';
import Fastify from 'fastify';
import { createHmac } from 'crypto';
import { saveUserToDatabase, getAllUserInfoInDB, getActiveUserInfoInDB, updateLogStatusInDatabase } from './userDatabase.js';

const serviceName = 'authentification';
const serviceport = process.env.PORT;

// Configuration Google OAuth 2.0
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Fonction pour encoder en URLSearchParams (remplace node-fetch)
function createFormData(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

// Fonction simple pour créer un JWT (remplace jsonwebtoken)
function createJWT(payload, secret, expiresIn = '24h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24h en secondes
  
  const payloadWithExp = { ...payload, exp };
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  
  const signature = createHmac('sha256', secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
    
  return `${base64Header}.${base64Payload}.${signature}`;
}

// Fonction pour vérifier un JWT
function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

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

// Middleware pour valider les tokens JWT
async function validateToken(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token d\'accès manquant' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token, JWT_SECRET);
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Token invalide ou expiré' });
  }
}

// API endpoint to check the availability and operational status of the service.
fastify.get('/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

// Endpoint de debug pour vérifier la configuration OAuth
fastify.get('/debug/oauth', async (request, reply) => {
  return {
    service: 'OAuth Debug',
    google_client_id: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT_SET',
    google_client_secret: GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    jwt_secret: JWT_SECRET ? 'SET' : 'NOT_SET',
    expected_redirect_uri: 'https://localhost:3000/auth/callback',
    test_auth_url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=https://localhost:3000/auth/callback&scope=openid%20profile%20email&response_type=code&state=debug`
  };
});

// Route pour recevoir les informations utilisateur d'Auth0
fastify.post('/userRegistering', async (request, reply) => {
  const { user } = request.body;
  console.log('!!! User info received from Auth0:', user);
 
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

  console.log('User info received for status update:', request.body);

  let nickname, status;
  
  nickname = request.body.nickname;
  status = request.body.status;

  console.log('Extracted data:', { nickname, status });

  if (!nickname || !status) 
  {
      return reply.status(400).send({ 
          error: 'User nickname and status are required',
          received: request.body 
      });
  }

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

// Route OAuth 2.0 pour échanger le code contre un token Google
fastify.post('/oauth/google', async (request, reply) => {
  const { code, redirect_uri } = request.body;
  
  console.log('OAuth Google code received from Popup:', { code, redirect_uri });

  if (!code || !redirect_uri) {
    return reply.status(400).send({ error: 'Code et redirect_uri requis' });
  }
  
  try 
  {
    // Échanger le code contre un token d'accès Google
    const formData = createFormData({
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    });
    
    console.log('Form data for token exchange:', formData);
    console.log('Sending request to Google OAuth token endpoint-> https://oauth2.googleapis.com/token');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!tokenResponse.ok) 
    {
      const errorData = await tokenResponse.text();
      console.error('Erreur échange de code:', errorData);
      return reply.status(400).send({ error: 'Échec de l\'échange du code' });
    }
    
    const tokenData = await tokenResponse.json();
    const googleAccessToken = tokenData.access_token;
    
    // Récupérer les informations utilisateur depuis Google
    console.log('Google access token received to get user info :', googleAccessToken);

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
      },
    });
    
    if (!userResponse.ok) 
    {
      return reply.status(400).send({ error: 'Échec de la récupération des informations utilisateur' });
    }
    
    const googleUser = await userResponse.json();

    console.log('Google user info received:', googleUser);
    
    // Mapper les données Google vers notre format
    const mappedUser = {
      sub: `google|${googleUser.id}`,
      email: googleUser.email,
      nickname: googleUser.name || 'Unknown',
      picture: googleUser.picture,
      givenName: googleUser.given_name || 'Unknown',
      familyName: googleUser.family_name || 'Unknown',
      status: 'active',
    };
    
    console.log('!! Google user mapped:', mappedUser);
    
    // Sauvegarder l'utilisateur en base de données
    const savedUser = await saveUserToDatabase(mappedUser);
    
    // Créer un JWT pour notre application
    const jwtToken = createJWT(
      { 
        id: savedUser.id,
        email: savedUser.email,
        nickname: savedUser.nickname,
        provider_id: savedUser.provider_id,
        picture: savedUser.picture,
        givenName: savedUser.givenName,
        familyName: savedUser.familyName
      },
      JWT_SECRET
    );

    console.log('JWT token created for user:', savedUser.nickname);
    
    return reply.status(200).send({
      access_token: jwtToken,
      user: {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        given_name: googleUser.given_name,
        family_name: googleUser.family_name,
      }
    });
    
  } 
  catch (error) {
    console.error('Erreur OAuth Google:', error);
    return reply.status(500).send({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// Route pour récupérer les informations de l'utilisateur connecté
fastify.get('/user', { preHandler: validateToken }, async (request, reply) => {
  
  console.log('!!! BACK User info requested:', request.user);

  try {
    const user = request.user;
    return reply.status(200).send({
      id: user.provider_id,
      email: user.email,
      name: user.nickname,
      picture: user.picture || null,
      given_name: user.givenName || null,
      family_name: user.familyName || null,
    });
  } 
  catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return reply.status(500).send({ error: 'Erreur interne du serveur' });
  }
});

// Route pour déconnecter l'utilisateur
fastify.post('/logout', { preHandler: validateToken }, async (request, reply) => {
  try {
    const user = request.user;
    
    // Mettre à jour le statut en base de données
    await updateLogStatusInDatabase({
      nickname: user.nickname,
      status: 'disconnected'
    });
    
    return reply.status(200).send({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return reply.status(500).send({ error: 'Erreur lors de la déconnexion' });
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
