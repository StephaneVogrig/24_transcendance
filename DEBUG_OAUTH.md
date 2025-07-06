# ## Problème Identifié

L'erreur "Erreur lors de la connexion avec Google. Veuillez réessayer." est causée par le fait que **le service d'authentification n'est pas démarré** sur le port 3001.

**⚠️ ERREUR NPM**: Si vous obtenez `npm ERR! Missing script: "dev"`, c'est parce que Node.js n'est pas installé dans votre environnement VS Code actuel.de de Débogage - Erreur Google OAuth

## Problème Identifié

L'erreur "Erreur lors de la connexion avec Google. Veuillez réessayer." est causée par le fait que **le service d'authentification n'est pas démarré**.

## Solution

### 1. Démarrer le service d'authentification

**⚠️ IMPORTANT**: Cette application est conçue pour fonctionner avec Docker. Node.js/npm ne sont pas disponibles dans l'environnement VS Code.

#### Option A: Avec Docker (OBLIGATOIRE)
```bash
cd /path/to/transcendance/rendu

# Démarrer uniquement le service d'authentification
docker-compose up authentification -d

# OU démarrer tous les services
docker-compose up -d

# OU si vous utilisez la nouvelle syntaxe Docker
docker compose up authentification -d
```

#### Option B: Installation locale (Alternative)
Si vous voulez développer sans Docker, vous devez installer Node.js sur votre système :
```bash
# Installer Node.js (version 18 ou 20)
# Ensuite :
cd rendu/backend/authentification
npm install
npm run dev  # Utilise tsx pour le hot reload
```

**Note**: Le script "dev" existe dans package.json mais nécessite que tsx soit installé.

### 2. Vérifier que le service fonctionne

Une fois démarré, testez :
```bash
curl http://localhost:3001/api/auth
```

Vous devriez voir : `{"message":"Service d'authentification Transcendence","status":"active"}`

### 3. Tester Google OAuth

```bash
curl http://localhost:3001/api/auth/google
```

Vous devriez voir une réponse avec `authUrl` contenant une URL Google.

## Debugging Étape par Étape

### Étape 1: Vérifier les services qui tournent
```bash
# Voir les ports utilisés
netstat -tulpn | grep :3001
netstat -tulpn | grep :8080

# Avec Docker
docker ps
```

### Étape 2: Vérifier les logs

#### Logs Docker
```bash
docker-compose logs authentification
docker-compose logs frontend
```

#### Logs Node.js (développement local)
Les erreurs s'affichent directement dans le terminal où vous avez démarré le service.

### Étape 3: Vérifier la configuration

1. **Fichier .env** : Vérifiez que vos identifiants Google sont corrects
```bash
cat .env | grep GOOGLE
```

2. **Accessibilité réseau** :
```bash
curl -v http://localhost:3001/api/auth
curl -v http://localhost:8080
```

### Étape 4: Tests dans le navigateur

1. Ouvrez les **outils de développement** (F12)
2. Allez dans l'onglet **Console**
3. Allez sur `http://localhost:8080/login`
4. Cliquez sur "Continue with Google"
5. Regardez les erreurs dans la console

## Erreurs Courantes et Solutions

### ❌ "Failed to fetch" ou erreur réseau
**Cause**: Service d'authentification pas démarré
**Solution**: Démarrer le service avec Docker ou npm

### ❌ "URL d'autorisation Google non disponible"
**Cause**: Variables d'environnement Google mal configurées
**Solution**: Vérifier `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`

### ❌ "CORS error"
**Cause**: Problème de configuration CORS
**Solution**: Vérifier que `CORS_ORIGIN=http://localhost:8080` dans `.env`

### ❌ "Invalid client"
**Cause**: ID client Google incorrect ou URL de redirection non autorisée
**Solution**: 
1. Vérifier les identifiants dans Google Cloud Console
2. Ajouter `http://localhost:3001/api/auth/google/callback` dans les URLs autorisées

## Configuration Google Cloud Console

Assurez-vous d'avoir configuré :

1. **APIs activées**: Google+ API ou People API
2. **Identifiants OAuth 2.0** avec :
   - Type : Application Web
   - URIs de redirection autorisés :
     - `http://localhost:3001/api/auth/google/callback`
   - Origines JavaScript autorisées :
     - `http://localhost:8080`

## Test Final

Une fois tout configuré, ce processus devrait fonctionner :

1. Service d'authentification démarre ✅
2. Frontend accessible sur http://localhost:8080 ✅
3. Clic sur "Continue with Google" ✅ 
4. Redirection vers Google ✅
5. Autorisation Google ✅
6. Retour vers votre app avec l'utilisateur connecté ✅

## Variables d'Environnement Requises

Votre fichier `.env` doit contenir :
```bash
GOOGLE_CLIENT_ID=votre-client-id-real
GOOGLE_CLIENT_SECRET=votre-client-secret-real
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
JWT_SECRET=une-clé-secrète-pour-jwt
NODE_ENV=development
```

## Si rien ne fonctionne

1. Redémarrez tous les services
2. Videz le cache du navigateur
3. Vérifiez que les ports 3001 et 8080 ne sont pas utilisés par d'autres applications
4. Testez avec les outils de développement du navigateur ouverts pour voir les erreurs exactes
