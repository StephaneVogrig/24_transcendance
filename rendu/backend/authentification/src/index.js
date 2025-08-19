import 'dotenv/config';
import Fastify from 'fastify';
import { createHmac } from 'crypto';
import { saveAuthUserToDatabase } from './userDatabase.js';
import { getAuthUserInfoInDB, updateLogStatusInDatabase } from './authUserInfo.js';

const serviceName = 'authentification';
const serviceport = process.env.PORT;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Fonction pour encoder en URLSearchParams
function createFormData(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

// Fonction simple pour créer un tocken JWT 
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


function verifyJWT(token, secret) {
  try 
  {
    const [header, payload, signature] = token.split('.');
    
    // Vérifier la signature
    const expectedSignature = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) 
      throw new Error('Invalid signature');

    // decode ce qu'on a recup de expectedSignature payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    console.log('verifyJWT -> Decoded JWT: ', decodedPayload);
    // verif expiration tocken
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000))
      throw new Error('Token expired');
  
    return decodedPayload;
  } 
  catch (error) {
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

// Fonction pour valider les tokens JWT
async function validateToken(request, reply) {
  try 
  {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) 
      return reply.status(401).send({ error: 'Token d\'accès manquant' });
    
    // extraction tocken d'accès
    const token = authHeader.split(' ')[1];

    // verif token JWT + extraction info user
    const decoded = verifyJWT(token, JWT_SECRET);
    request.user = decoded;
  } 
  catch (error) {
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


// fastify.get('/getActiveAuthUserInfo', async (request, reply) => {
//    try {
//         const users = await getActiveAuthUserInfo(); // appel du backend database
       
//         if (!users || users.length === 0) {
//             return reply.status(200).send([]);
//         }
           
//         reply.status(200).send(users); // Envoie la liste des utilisateurs
//     }
//     catch (error) {
//         console.error('Erreur getUserInfo:', error);
//         reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
//     }
// });

fastify.get('/getAuthUserInfo', async (request, reply) => {
   try {
        const { nickname } = request.query;
        console.log('Received nickname:', nickname);

        if (!nickname) 
            return reply.status(400).send({ error: 'Missing required field: nickname' });

        console.log('Fetching user from the database with nickname:', nickname);
        const user = await getAuthUserInfoInDB(nickname);// appel du backend database
        
        // user est un tableau d'objets
        if (!user || user.length === 0)
            return reply.status(200).send([]);

        reply.status(200).send(user); // Envoie tableau avec 1 utilisateur
    }
    catch (error) {
        console.error('Erreur get UserInfo:', error);
        reply.status(500).send({ error: 'Erreur lors de la récupération de l utilisateur' });
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

// Route OAuth 2.0 pour échange code contre un token Google
// recupere info utilisateur et crée un JWT
// route appelée par front après que l'utilisateur ai autorisé l'application avec popup OAuth
// frontend envoie code d'autorisation + URI redirection
fastify.post('/oauth/googleCodeToTockenUser', async (request, reply) => {

  const { code, redirect_uri } = request.body;
  
  console.log('OAuth Google code received from Popup:', { code, redirect_uri });
  console.log('Environment check:', {
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
    GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing'
  });

  if (!code || !redirect_uri) 
    return reply.status(400).send({ error: 'Code et redirect_uri requis' });
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth credentials');
    return reply.status(500).send({ error: 'Configuration OAuth manquante' });
  }
  
  // Échange code contre un token d'accès Google 
  // on demande à Google de nous donner un token d'accès -> https://oauth2.googleapis.com/token
  try
  {
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
      console.error('Google token exchange failed:');
      console.error('Status:', tokenResponse.status);
      console.error('StatusText:', tokenResponse.statusText);
      console.error('Error data:', errorData);
      console.error('Request data sent:', formData);
      return reply.status(400).send({ 
        error: 'Échec de l\'échange du code',
        details: errorData,
        status: tokenResponse.status 
      });
    }
    
    const tokenData = await tokenResponse.json();
    const googleAccessToken = tokenData.access_token;
    
    
    console.log('Google access token received to get user info :', googleAccessToken);

    // Récupérer les informations utilisateur depuis Google
    // on demande à l'api Google de nous donner les infos utilisateur 
    // on envoie token d'accès recup -> https://www.googleapis.com/oauth2/v2/userinfo
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
      },
    });
    
    if (!userResponse.ok) 
    {
      return reply.status(400).send({ error: 'Échec de la récupération des informations utilisateur' });
    }
    
    // on recup les infos utilisateur du fetch 
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
    
    // Sauvegarde utilisateur dans db
    const savedUser = await saveAuthUserToDatabase(mappedUser);
    
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

// Route pour récupérer les informations de l'utilisateur avec le token JWT
// !! dans cette route on vérifie le token JWT envoyé par le frontend -> preHandler: validateToken
fastify.get('/userInfoJWT', { preHandler: validateToken }, async (request, reply) => {
  
  const user = request.user;
  console.log('!!! AUTH BACK User info requested for ', user.nickname);

  try 
  {
    // 1.Vérifier que le nickname existe bien dans la base de données
    const userInfoArr = await getAuthUserInfoInDB(user.nickname);

    console.log('User info retrieved from database:', userInfoArr);

    // const userInfo = userInfoArr && userInfoArr[0];

    if (!userInfoArr || userInfoArr.length === 0) 
    {
      console.error('Erreur récupération utilisateur: Utilisateur non trouvé dans la db');
      return reply.status(404).send({ error: 'User not found: Utilisateur n\'existe pas dans la db' });
    }

    const userInfo = userInfoArr[0];
    console.log('User info found in database:', userInfo);
    console.log('User info to return:userInfoArr[0]', userInfoArr[0])
    // ✅ SÉCURITÉ SUPPLÉMENTAIRE : Vérifier que userInfo existe
    if (!userInfo) 
    {
      console.error('Erreur récupération utilisateur: Données utilisateur vides');
      return reply.status(404).send({ error: 'User data is empty' });
    }

    // 2. Retourner les informations utilisateur depuis la base de données
    return reply.status(200).send({
      id: userInfo.provider_id || userInfo.id,
      email: userInfo.email,
      name: userInfo.nickname,
      picture: userInfo.picture || null,
      given_name: userInfo.givenName || null,
      family_name: userInfo.familyName || null,
    });
  } catch (error) {
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
