import Fastify from 'fastify';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('🚀 Démarrage du test minimal...');
console.log('Variables d\'environnement:');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Défini' : 'Manquant');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Défini' : 'Manquant');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Défini' : 'Manquant');

const start = async () => {
  try {
    console.log('📦 Création de l\'instance Fastify...');
    const fastify = Fastify({ logger: true });

    console.log('🔌 Test de route simple...');
    fastify.get('/api/auth', async (request, reply) => {
      return { message: 'Service d\'authentification - Test minimal', status: 'active' };
    });

    console.log('🌐 Tentative d\'écoute sur le port 3001...');
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    
    console.log('✅ Service démarré avec succès sur le port 3001');
    
  } catch (err) {
    console.error('❌ Erreur lors du démarrage:', err);
    process.exit(1);
  }
};

start();
