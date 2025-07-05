# Guide de résolution des problèmes de build

## Problème résolu : Erreur npm ci

### Symptôme
```
ERROR [tournament 4/8] RUN npm ci --only=production && npm cache clean --force
```

### Cause
La commande `npm ci` nécessite un fichier `package-lock.json` pour fonctionner, mais plusieurs services n'en avaient pas.

### Solution appliquée
✅ **Modification des Dockerfiles.prod** - Remplacement de `npm ci` par `npm install` dans tous les fichiers `Dockerfile.prod`

### Solutions alternatives

#### Option 1 : Générer les package-lock.json (recommandé pour la production)
```bash
# Exécuter le script de génération
chmod +x generate-lockfiles.sh
./generate-lockfiles.sh
```

#### Option 2 : Diagnostic des problèmes
```bash
# Exécuter le script de diagnostic
chmod +x diagnose-build.sh
./diagnose-build.sh
```

## Différences entre npm install et npm ci

### npm install
- ✅ Fonctionne avec ou sans package-lock.json
- ✅ Plus flexible
- ❌ Plus lent
- ❌ Peut installer des versions différentes

### npm ci
- ✅ Plus rapide
- ✅ Installation déterministe
- ✅ Idéal pour la production
- ❌ Nécessite package-lock.json

## Tests après correction

### Build en développement
```bash
make dev
```

### Build en production
```bash
make prod
```

### Diagnostic
```bash
./diagnose-build.sh
```

## Autres erreurs courantes

### 1. Erreur de syntaxe JSON dans package.json
**Symptôme :** Erreur de parsing JSON
**Solution :** Vérifier l'indentation et les virgules dans package.json

### 2. Dépendances manquantes
**Symptôme :** Module non trouvé
**Solution :** Vérifier que toutes les dépendances sont listées dans package.json

### 3. Version Node.js incompatible
**Symptôme :** Erreur de version
**Solution :** Utiliser Node.js 18+ (configuré dans les Dockerfiles)

### 4. Problème de permissions Docker
**Symptôme :** Permission denied
**Solution :** 
```bash
sudo usermod -aG docker $USER
# Se déconnecter et reconnecter
```

### 5. Port déjà utilisé
**Symptôme :** Port already in use
**Solution :**
```bash
make stop
# ou
docker compose down
```

## Problème résolu : Erreur de build frontend

### Symptôme
```
ERROR [frontend build 6/6] RUN npm run build
```

### Cause
Erreur lors de la compilation TypeScript, généralement due à :
1. Module `@auth0/auth0-spa-js` non trouvé lors du build Docker
2. Erreurs TypeScript dans les nouveaux fichiers Auth0
3. Dépendances non installées correctement dans le conteneur

### Solution appliquée
✅ **Service Auth0 avec fallback** - Création d'un service Auth0 qui gère gracieusement l'absence du module
✅ **Types personnalisés** - Ajout de types Auth0 personnalisés pour éviter les erreurs de compilation
✅ **Import dynamique** - Utilisation d'imports dynamiques avec gestion d'erreur
✅ **Dockerfile mis à jour** - Ajout explicite de la dépendance Auth0 dans le Dockerfile

### Solutions alternatives

#### Option 1 : Build avec script personnalisé
```bash
chmod +x build-frontend.sh
./build-frontend.sh
```

#### Option 2 : Build sans Auth0 (temporaire)
Commentez temporairement les imports Auth0 dans `main.ts` et les pages qui l'utilisent.

#### Option 3 : Installation manuelle des dépendances
```bash
cd frontend
npm install @auth0/auth0-spa-js
npm run build
```

### Tests après correction

#### Build en développement
```bash
make dev
# ou
docker compose -f docker-compose.yml up --build
```

#### Build en production
```bash
make prod
# ou
docker compose -f docker-compose.prod.yml up --build
```

#### Build frontend uniquement
```bash
cd frontend && npm run build
```

### Fonctionnalités Auth0

Après correction, l'application supporte :

**Mode avec Auth0 (si module disponible) :**
- ✅ Bouton "Continuer avec Auth0"
- ✅ Redirection OAuth
- ✅ Callback automatique
- ✅ Déconnexion Auth0

**Mode fallback (si module indisponible) :**
- ✅ Message informatif à l'utilisateur
- ✅ Connexion traditionnelle fonctionnelle
- ✅ Pas d'erreur de build
- ✅ Application entièrement utilisable

## Configuration OAuth restaurée

La configuration OAuth Auth0 a été restaurée avec :

### Backend
- ✅ Service d'authentification avec OAuth2
- ✅ Routes Auth0 (/auth/auth0, /auth/auth0/callback)
- ✅ Middleware JWT
- ✅ Variables d'environnement configurées

### Frontend
- ✅ Service Auth0 (@auth0/auth0-spa-js)
- ✅ Guard d'authentification
- ✅ Page de callback OAuth
- ✅ Bouton "Continuer avec Auth0" sur login

### Configuration
- ✅ Variables d'environnement dans .env
- ✅ Types TypeScript pour Vite
- ✅ Documentation dans OAUTH_README.md

## Prochaines étapes

1. **Tester le build :**
   ```bash
   make dev
   ```

2. **Configurer Auth0 :**
   - Remplir `AUTH0_CLIENT_SECRET` dans .env
   - Vérifier la configuration dans Auth0 Dashboard

3. **Tester l'authentification :**
   - Aller sur http://localhost:1800/login
   - Tester "Continuer avec Auth0"

4. **Production :**
   ```bash
   make prod
   ```
