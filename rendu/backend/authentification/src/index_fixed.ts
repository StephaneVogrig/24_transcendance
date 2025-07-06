import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { GoogleAuthService } from './googleAuthService';
import { UserService } from './userService';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Declare global process for Node.js
declare const process: {
  exit: (code?: number) => never;
  env: Record<string, string | undefined>;
};

const start = async () => {
  const fastify = Fastify({ logger: true });

  // Enregistrer les plugins
  await fastify.register(cors, {
    origin: ['http://localhost:8080', 'http://localhost:5173'],
    credentials: true
  });

  await fastify.register(cookie);

  // Initialiser le service d'authentification Google
  const googleAuthService = new GoogleAuthService();

  // Routes d'authentification
  fastify.get('/api/auth', async (request, reply) => {
    return { message: 'Service d\'authentification Transcendence', status: 'active' };
  });

  // Route pour obtenir l'URL d'autorisation Google
  fastify.get('/api/auth/google', async (request, reply) => {
    try {
      const authUrl = googleAuthService.getAuthUrl();
      return { authUrl };
    } catch (error) {
      reply.status(500);
      return { error: 'Erreur lors de la génération de l\'URL d\'autorisation' };
    }
  });

  // Route pour obtenir l'URL d'autorisation Google pour l'enregistrement
  fastify.get('/api/auth/google/register', async (request, reply) => {
    try {
      const authUrl = googleAuthService.getAuthUrl('register');
      return { authUrl };
    } catch (error) {
      reply.status(500);
      return { error: 'Erreur lors de la génération de l\'URL d\'autorisation pour l\'enregistrement' };
    }
  });

  // Route de callback Google OAuth
  fastify.get('/api/auth/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code, state } = request.query as { code?: string; state?: string };

      if (!code) {
        reply.status(400);
        return { error: 'Code d\'autorisation manquant' };
      }

      // Déterminer l'action (login ou register) basée sur le paramètre state
      const action = (state === 'register') ? 'register' : 'login';
      const authResult = await googleAuthService.exchangeCodeForTokens(code, action);

      if (!authResult.success) {
        reply.status(401);
        return { error: authResult.message || 'Authentification échouée' };
      }

      // Définir le cookie avec le token
      reply.setCookie('auth_token', authResult.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      // Rediriger vers le frontend avec l'action appropriée
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const authParam = action === 'register' ? 'register_success' : 'success';
      reply.redirect(`${redirectUrl}?auth=${authParam}`);

    } catch (error) {
      console.error('Erreur callback Google:', error);
      reply.status(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Route pour vérifier l'authentification
  fastify.get('/api/auth/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.auth_token;

      if (!token) {
        reply.status(401);
        return { authenticated: false, message: 'Token manquant' };
      }

      const decoded = googleAuthService.verifyJWT(token);

      if (!decoded) {
        reply.status(401);
        return { authenticated: false, message: 'Token invalide' };
      }

      const user = await UserService.findById(decoded.userId);

      if (!user) {
        reply.status(401);
        return { authenticated: false, message: 'Utilisateur non trouvé' };
      }

      return {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      };

    } catch (error) {
      console.error('Erreur vérification token:', error);
      reply.status(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Route pour se déconnecter
  fastify.post('/api/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('auth_token');
    return { success: true, message: 'Déconnexion réussie' };
  });

  // Route pour obtenir le profil utilisateur
  fastify.get('/api/auth/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.auth_token;

      if (!token) {
        reply.status(401);
        return { error: 'Non authentifié' };
      }

      const decoded = googleAuthService.verifyJWT(token);

      if (!decoded) {
        reply.status(401);
        return { error: 'Token invalide' };
      }

      const user = await UserService.findById(decoded.userId);

      if (!user) {
        reply.status(404);
        return { error: 'Utilisateur non trouvé' };
      }

      return { user };

    } catch (error) {
      console.error('Erreur récupération profil:', error);
      reply.status(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Route de debug pour voir tous les utilisateurs (à supprimer en production)
  fastify.get('/api/auth/users', async (request, reply) => {
    if (process.env.NODE_ENV === 'production') {
      reply.status(404);
      return { error: 'Route non disponible en production' };
    }

    const users = UserService.getAllUsers();
    return { users };
  });

  // Démarrer le serveur
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Service d'authentification écoute sur le port 3001`);
    console.log(`URL Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configuré' : 'Non configuré'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
