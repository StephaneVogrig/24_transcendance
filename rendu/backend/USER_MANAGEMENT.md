# Système de Sauvegarde des Utilisateurs OAuth

Ce système permet de sauvegarder automatiquement les utilisateurs authentifiés via Auth0 dans la base de données SQLite.

## 🏗️ Architecture

```
Frontend (Auth0) → Service Auth → Service DB → SQLite
```

## 📋 Structure de la Base de Données

### Table `users` mise à jour :

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,        -- Nom d'utilisateur
    password TEXT,                        -- Mot de passe (nullable pour OAuth)
    email TEXT,                          -- Email de l'utilisateur
    auth0_id TEXT UNIQUE,                -- ID Auth0 unique
    picture TEXT,                        -- URL de l'avatar
    provider TEXT DEFAULT 'local',       -- Provider: 'local', 'auth0', 'google'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Installation et Configuration

### 1. Service de Base de Données

```bash
cd backend/database
npm install
npm run migrate  # Migrer la base de données
npm run dev      # Démarrer le service
```

### 2. Service d'Authentification

```bash
cd backend/authentification
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm run dev           # Démarrer le service
```

### 3. Variables d'Environnement

Fichier `.env` pour le service d'authentification :

```env
# Configuration de la base de données
DATABASE_SERVICE_URL=http://localhost:3003

# Configuration du service
HOST_IP=localhost
PORT=3001
```

## 📡 API Endpoints

### Service de Base de Données (Port 3003)

#### Créer/Mettre à jour un utilisateur OAuth
```http
POST /api/database/user/oauth
Content-Type: application/json

{
    "auth0_id": "auth0|123456789",
    "email": "user@example.com", 
    "name": "John Doe",
    "picture": "https://avatar.url",
    "provider": "auth0"
}
```

#### Récupérer un utilisateur par Auth0 ID
```http
GET /api/database/user/oauth/{auth0_id}
```

### Service d'Authentification (Port 3001)

#### Sauvegarder les informations utilisateur d'Auth0
```http
POST /api/auth/user
Content-Type: application/json

{
    "user": {
        "sub": "auth0|123456789",
        "email": "user@example.com",
        "name": "John Doe", 
        "picture": "https://avatar.url"
    }
}
```

#### Récupérer un utilisateur
```http
GET /api/auth/user/{auth0_id}
```

## 🔄 Flux d'Authentification

1. **Frontend** : L'utilisateur clique sur "Se connecter avec Google"
2. **Auth0** : Redirection vers Google OAuth
3. **Google** : Authentification et retour vers Auth0
4. **Auth0** : Redirection vers `/auth/callback` avec les informations utilisateur
5. **Frontend** : `auth0Service.ts` traite le callback et récupère les infos utilisateur
6. **Frontend** : Envoi automatique des infos utilisateur vers `/api/auth/user`
7. **Service Auth** : Reçoit les infos et les transmet au service de base de données
8. **Service DB** : Sauvegarde ou met à jour l'utilisateur en base

## 🧪 Tests

### Tester la sauvegarde utilisateur

```bash
cd backend/authentification
node src/testUserDatabase.js
```

### Tester la migration de base de données

```bash
cd backend/database
npm run migrate
```

## 🔧 Développement

### Ajouter un nouveau provider OAuth

1. Modifier la table `users` pour ajouter le provider
2. Créer une nouvelle route dans le service de base de données
3. Modifier `userDatabase.js` pour supporter le nouveau provider
4. Mettre à jour `auth0Service.ts` pour gérer le nouveau provider

### Personnaliser la sauvegarde

Modifiez la fonction `saveUserToDatabase` dans `userDatabase.js` pour :
- Ajouter des validations personnalisées
- Transformer les données avant sauvegarde
- Ajouter des logs spécifiques
- Gérer des cas d'erreur particuliers

## 📝 Logs

Le système génère des logs détaillés :

```
✅ User saved to database: { auth0_id: 'auth0|123...', email: 'user@example.com' }
🔍 Fetching user from database: auth0|123456789
📝 Sauvegarde de l'utilisateur de test...
```

## 🚨 Gestion d'Erreur

- **Utilisateur manquant** : Retourne 404
- **Données invalides** : Retourne 400 avec détails
- **Erreur de base de données** : Retourne 500 avec logs
- **Service indisponible** : Retry automatique côté frontend

## 🔒 Sécurité

- Les mots de passe sont hachés avec bcrypt (utilisateurs locaux)
- Les tokens Auth0 ne sont pas stockés côté serveur
- Validation des données d'entrée
- Contraintes d'unicité sur `auth0_id` et `username`
