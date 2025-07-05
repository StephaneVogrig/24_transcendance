# Configuration OAuth Auth0

Ce projet utilise Auth0 pour l'authentification OAuth. Voici comment configurer et utiliser cette fonctionnalité.

## Configuration Auth0

### 1. Variables d'environnement

Assurez-vous que votre fichier `.env` contient les variables suivantes :

```env
# Frontend Auth0 Configuration (utilisé par Vite)
VITE_AUTH0_DOMAIN=dev-yo45rdk5nhctgvu2.eu.auth0.com
VITE_AUTH0_CLIENT_ID=VksN5p5Q9jbXcBAOw72RLLogClp44FVH
VITE_AUTH0_CALLBACK_URL=http://localhost:5173

# Backend Auth0 Configuration
AUTH0_DOMAIN=dev-yo45rdk5nhctgvu2.eu.auth0.com
AUTH0_CLIENT_ID=VksN5p5Q9jbXcBAOw72RLLogClp44FVH
AUTH0_CLIENT_SECRET=votre-client-secret-ici
AUTH0_CALLBACK_URL=http://localhost:3001/auth/auth0/callback
JWT_SECRET=votre-jwt-secret-ici
FRONTEND_URL=http://localhost:1800
```

### 2. Configuration Auth0 Dashboard

Dans votre dashboard Auth0 :

1. **Application Settings** :
   - Application Type : `Single Page Application`
   - Allowed Callback URLs : `http://localhost:1800/auth/callback, http://localhost:3001/auth/auth0/callback`
   - Allowed Logout URLs : `http://localhost:1800`
   - Allowed Web Origins : `http://localhost:1800`

2. **APIs** :
   - Créez une API si nécessaire pour votre backend
   - Notez l'identifier de l'API

## Architecture

### Frontend (SPA)
- Utilise `@auth0/auth0-spa-js` pour la gestion OAuth côté client
- Service `auth0Service.ts` pour centraliser la logique d'authentification
- Guard `AuthGuard.ts` pour protéger les routes
- Page de callback `AuthCallbackPage.ts` pour gérer le retour d'Auth0

### Backend (API)
- Service d'authentification avec Fastify
- Middleware OAuth2 avec `@fastify/oauth2`
- Routes pour l'authentification et la vérification des tokens
- Intégration avec JWT pour les sessions

## Utilisation

### Connexion OAuth
1. L'utilisateur clique sur "Continuer avec Auth0" sur la page de login
2. Redirection vers Auth0 pour l'authentification
3. Retour sur `/auth/callback` avec les tokens
4. Stockage des informations utilisateur et redirection vers l'application

### Authentification traditionnelle
Le système supporte également l'authentification traditionnelle par email/mot de passe en parallèle d'OAuth.

### Protection des routes
```typescript
import { AuthGuard } from '../auth/AuthGuard';

export const ProtectedPage = (): HTMLElement => {
    // Vérifier l'authentification
    AuthGuard.requireAuth();
    
    // Contenu de la page...
};
```

### Récupération de l'utilisateur
```typescript
const user = await AuthGuard.getCurrentUser();
```

### Déconnexion
```typescript
await AuthGuard.logout();
```

## Déploiement

Pour le déploiement en production :

1. Mettez à jour les URLs dans Auth0 Dashboard
2. Configurez les variables d'environnement de production
3. Assurez-vous que HTTPS est activé
4. Mettez à jour les fichiers `.env.prod` et `docker-compose.prod.yml`

## Dépannage

### Erreurs courantes

1. **"Cannot find module '@auth0/auth0-spa-js'"**
   - Exécutez `npm install` dans le dossier frontend

2. **"Auth0 configuration missing"**
   - Vérifiez les variables d'environnement `VITE_AUTH0_*`

3. **"Invalid callback URL"**
   - Vérifiez que l'URL de callback est configurée dans Auth0 Dashboard

4. **"Token expired"**
   - Auth0 gère automatiquement le refresh des tokens

### Logs
- Backend : Les logs OAuth sont visibles dans les logs du service d'authentification
- Frontend : Vérifiez la console du navigateur pour les erreurs côté client

## Sécurité

- Les secrets ne doivent jamais être exposés côté client
- Utilisez HTTPS en production
- Configurez correctement les domaines autorisés dans Auth0
- Implémentez une validation des tokens côté backend
