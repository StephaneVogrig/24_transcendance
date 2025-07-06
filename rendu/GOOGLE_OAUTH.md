# Configuration Google OAuth

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
JWT_SECRET=votre-clé-jwt-secrète
```

## Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet et activez l'API Google+
3. Créez des identifiants OAuth 2.0 avec :
   - Type : Application Web
   - URI de redirection : `http://localhost:3001/api/auth/google/callback`
   - Origine JavaScript : `http://localhost:8080`

## Fonctionnalités ajoutées

### Backend
- Routes Google OAuth (connexion et enregistrement)
- Service d'authentification avec JWT
- Gestion des utilisateurs en mémoire

### Frontend  
- Bouton "Continue with Google" sur la page de connexion
- Bouton "Sign up with Google" sur la page d'enregistrement
- Service d'authentification pour gérer l'état utilisateur
- Page de profil pour afficher les informations Google

## Utilisation

1. Démarrez l'application avec `docker-compose up`
2. Allez sur `http://localhost:8080/login` ou `/register`
3. Cliquez sur les boutons Google OAuth
4. Autorisez l'application
5. Vous serez redirigé avec l'utilisateur connecté
