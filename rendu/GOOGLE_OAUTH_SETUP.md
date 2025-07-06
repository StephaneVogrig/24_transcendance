# Configuration de l'Enregistrement Google OAuth

Cette documentation explique comment configurer et utiliser l'enregistrement des utilisateurs via Google OAuth dans l'application Transcendance.

## Fonctionnalités Ajoutées

### Backend (Service d'Authentification)

1. **Routes Google OAuth** :
   - `GET /api/auth/google` - Obtenir l'URL d'autorisation pour la connexion
   - `GET /api/auth/google/register` - Obtenir l'URL d'autorisation pour l'enregistrement
   - `GET /api/auth/google/callback` - Callback pour traiter la réponse Google
   - `GET /api/auth/verify` - Vérifier l'authentification de l'utilisateur
   - `GET /api/auth/profile` - Obtenir le profil utilisateur
   - `POST /api/auth/logout` - Se déconnecter

2. **Gestion différenciée Login/Register** :
   - Le paramètre `state` dans l'URL Google OAuth distingue entre connexion et enregistrement
   - Pour l'enregistrement : vérifie que l'utilisateur n'existe pas déjà
   - Pour la connexion : permet de lier un compte existant ou refuse si aucun compte

3. **Service utilisateur en mémoire** :
   - Stockage temporaire des utilisateurs (à remplacer par une vraie DB en production)
   - Gestion des utilisateurs Google avec toutes leurs informations

### Frontend

1. **Page d'enregistrement améliorée** (`RegisterPage.ts`) :
   - Formulaire d'enregistrement traditionnel (nom, email, mot de passe)
   - Bouton "Sign up with Google" pour l'enregistrement OAuth
   - Gestion des retours de Google OAuth avec paramètre `register_success`

2. **Page de connexion améliorée** (`LoginPage.ts`) :
   - Bouton "Continue with Google" pour la connexion OAuth
   - Différenciation claire entre connexion et enregistrement

3. **Service d'authentification** (`authService.ts`) :
   - Gestion de l'état utilisateur global
   - Vérification automatique de l'authentification
   - Support des utilisateurs Google OAuth

4. **Page de profil** (`UserProfilePage.ts`) :
   - Affichage des informations Google (nom, email, photo)
   - Indicateur de méthode de connexion (Google)

## Configuration Requise

### 1. Variables d'Environnement

Créer un fichier `.env` dans le dossier `/rendu/` basé sur `.env.example` :

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:8080

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
```

### 2. Configuration Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API Google+ et Google OAuth2
4. Créer des identifiants OAuth 2.0 :
   - Type d'application : Application Web
   - URI de redirection autorisés : `http://localhost:3001/api/auth/google/callback`
   - Origines JavaScript autorisées : `http://localhost:8080`

5. Copier le Client ID et Client Secret dans votre fichier `.env`

### 3. Installation des Dépendances

```bash
# Backend - Service d'authentification
cd rendu/backend/authentification
npm install

# Frontend
cd ../../frontend
npm install
```

## Utilisation

### Flow d'Enregistrement Google OAuth

1. **Utilisateur clique sur "Sign up with Google"** sur la page `/register`
2. **Redirection vers Google** avec le paramètre `state=register`
3. **Utilisateur s'authentifie** sur Google et autorise l'application
4. **Callback traité** par `/api/auth/google/callback`
5. **Vérification** : si l'utilisateur existe déjà → erreur
6. **Création utilisateur** avec les informations Google
7. **Génération JWT** et redirection vers `/profile`

### Flow de Connexion Google OAuth

1. **Utilisateur clique sur "Continue with Google"** sur la page `/login`
2. **Redirection vers Google** avec le paramètre `state=login` (par défaut)
3. **Callback traité** par `/api/auth/google/callback`
4. **Recherche utilisateur** : si trouvé → connexion, sinon → erreur
5. **Génération JWT** et redirection vers la page d'accueil

### Gestion des Erreurs

Le système gère plusieurs cas d'erreur :

- **Enregistrement** : Compte Google ou email déjà existant
- **Connexion** : Aucun compte trouvé avec ce Google ID
- **Général** : Erreurs réseau, tokens invalides, etc.

## Sécurité

### Mesures Implémentées

1. **JWT sécurisé** : cookies httpOnly, secure en production
2. **Validation côté serveur** : vérification des tokens Google
3. **State parameter** : protection contre les attaques CSRF
4. **CORS configuré** : restriction des origines autorisées

### À Ajouter en Production

1. **Base de données persistante** (remplacer le stockage en mémoire)
2. **Validation renforcée** des données utilisateur
3. **Rate limiting** sur les endpoints d'authentification
4. **Logs de sécurité** pour le monitoring
5. **HTTPS obligatoire** en production

## Structure des Données Utilisateur

```typescript
interface User {
  id: string;               // ID unique généré
  email: string;            // Email Google
  name: string;             // Nom complet Google
  picture?: string;         // URL photo de profil Google
  provider: 'google';       // Type de provider
  googleId: string;         // ID Google unique
  createdAt: Date;          // Date de création
  updatedAt: Date;          // Date de mise à jour
}
```

## Test de l'Intégration

### 1. Démarrer les Services

```bash
# Terminal 1 - Base de données
cd rendu
docker-compose up database -d

# Terminal 2 - Gateway
cd rendu/backend/gateway
npm run dev

# Terminal 3 - Service d'authentification
cd rendu/backend/authentification
npm run dev

# Terminal 4 - Frontend
cd rendu/frontend
npm run dev
```

### 2. Tester l'Enregistrement

1. Aller sur `http://localhost:8080/register`
2. Cliquer sur "Sign up with Google"
3. S'authentifier avec un compte Google
4. Vérifier la redirection vers `/profile`
5. Confirmer les informations utilisateur affichées

### 3. Tester la Connexion

1. Aller sur `http://localhost:8080/login`
2. Cliquer sur "Continue with Google"
3. Utiliser le même compte Google
4. Vérifier la connexion réussie

## Debugging

### Logs Utiles

```bash
# Vérifier les utilisateurs en mémoire (dev seulement)
curl http://localhost:3001/api/auth/users

# Vérifier l'authentification
curl -b cookies.txt http://localhost:3001/api/auth/verify

# Obtenir le profil
curl -b cookies.txt http://localhost:3001/api/auth/profile
```

### Problèmes Courants

1. **"URL d'autorisation Google non disponible"** : Vérifier les variables d'environnement
2. **"Erreur CORS"** : Vérifier la configuration CORS dans le backend
3. **"Token invalide"** : Vérifier le JWT_SECRET et la configuration Google
4. **"Compte déjà existant"** : Normal pour l'enregistrement, utiliser la connexion

## Migration en Production

1. **Remplacer le stockage en mémoire** par PostgreSQL/MongoDB
2. **Configurer HTTPS** pour tous les endpoints
3. **Mettre à jour les URLs** Google OAuth avec le domaine de production
4. **Implémenter la persistance** des sessions
5. **Ajouter la validation** et sanitisation des données
6. **Configurer le monitoring** et les alertes

## Extensions Possibles

1. **Autres providers OAuth** : GitHub, Discord, Facebook
2. **Two-Factor Authentication** (2FA)
3. **Gestion des rôles** et permissions
4. **API de gestion** des utilisateurs pour les admins
5. **Notifications** par email pour les nouveaux comptes
