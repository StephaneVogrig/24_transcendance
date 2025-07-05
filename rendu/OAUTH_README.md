# Configuration OAuth Google avec Auth0

Ce guide explique comment configurer Google OAuth dans votre application Transcendance.

## 1. Configuration Auth0

### Créer une application Auth0
1. Allez sur [Auth0 Dashboard](https://manage.auth0.com/)
2. Créez un nouveau tenant ou utilisez un existant
3. Créez une nouvelle application de type "Single Page Application"
4. Notez votre **Domain** et **Client ID**

### Configuration de l'application
Dans les paramètres de votre application Auth0 :

**Allowed Callback URLs:**
```
http://localhost:1800/auth/callback,
http://localhost:8080/auth/callback,
https://votre-domaine.com/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:1800,
http://localhost:8080,
https://votre-domaine.com
```

**Allowed Web Origins:**
```
http://localhost:1800,
http://localhost:8080,
https://votre-domaine.com
```

## 2. Configuration Google OAuth

### Activer Google Social Connection dans Auth0
1. Allez dans **Authentication > Social**
2. Cliquez sur **+ Create Connection**
3. Sélectionnez **Google**
4. Vous devez configurer Google OAuth dans Google Cloud Console

### Configuration Google Cloud Console
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ ou Google OAuth2
4. Allez dans **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configurez l'écran de consentement OAuth
6. Créez un Client ID de type "Web application"

**Authorized JavaScript origins:**
```
https://votre-domaine-auth0.eu.auth0.com
```

**Authorized redirect URIs:**
```
https://votre-domaine-auth0.eu.auth0.com/login/callback
```

7. Copiez le **Client ID** et **Client Secret**
8. Collez-les dans la configuration Google de Auth0

## 3. Configuration de l'application

### Variables d'environnement
Créez un fichier `.env` dans le dossier frontend :

```env
VITE_AUTH0_DOMAIN=votre-domaine.eu.auth0.com
VITE_AUTH0_CLIENT_ID=votre-client-id-auth0
VITE_APP_URL=http://localhost:8080
```

### Mise à jour du code
Modifiez `frontend/src/auth/auth0Service.ts` :

```typescript
const AUTH0_DOMAIN = 'votre-domaine.eu.auth0.com';
const AUTH0_CLIENT_ID = 'votre-client-id-auth0';
```

## 4. Test de l'authentification

1. Démarrez l'application : `make dev` ou `make prod`
2. Allez sur la page de connexion : `http://localhost:8080/login`
3. Cliquez sur "Continue with Google"
4. Vous devriez être redirigé vers Google pour l'authentification
5. Après authentification, vous serez redirigé vers `/choice-game`

## 5. Fonctionnalités disponibles

### Boutons OAuth ajoutés
- **Continue with Google** : Connexion directe avec Google
- **Continue with Auth0** : Interface Auth0 universelle (affiche toutes les options disponibles)

### Pages et services
- `LoginPage.ts` : Page de connexion avec boutons OAuth
- `AuthCallbackPage.ts` : Page de traitement du callback Auth0
- `auth0Service.ts` : Service de gestion Auth0
- `AuthGuard.ts` : Protection des routes authentifiées

### Protection des routes
Pour protéger une route, utilisez le guard :

```typescript
import { withAuthGuard } from './auth/AuthGuard';
import { GamePage } from './pages/GamePage';

addRoute('/game', withAuthGuard(GamePage));
```

## 6. Dépannage

### Erreurs courantes
- **Invalid redirect_uri** : Vérifiez les URLs autorisées dans Auth0
- **Access denied** : Vérifiez la configuration Google OAuth
- **Client ID not found** : Vérifiez les variables d'environnement

### Debug
Activez les logs dans la console du navigateur pour voir les détails des erreurs OAuth.

## 7. Production

Pour la production :
1. Mettez à jour les URLs autorisées avec votre domaine de production
2. Configurez les variables d'environnement de production
3. Activez HTTPS (recommandé pour OAuth)
4. Testez le flow complet d'authentification
