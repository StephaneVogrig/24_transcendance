# Architecture Microservices - Jeu Pong

## Vue d'ensemble de l'architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Load Balancer │
│   (React/Vue)   │◄──►│   (Kong/Nginx)   │◄──►│   (Nginx/HAProxy)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ Auth Service │ │Game Service │ │Tournament │
        │   (Node.js)  │ │  (Node.js)  │ │ Service   │
        └──────────────┘ └─────────────┘ └───────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │   SQLite     │ │  WebSocket  │ │  SQLite   │
        │   Database   │ │   Server    │ │ Database  │
        └──────────────┘ └─────────────┘ └───────────┘
                                │
                        ┌───────▼──────┐
                        │ Blockchain   │
                        │   Service    │
                        └──────────────┘
```

## Services détaillés

### 1. API Gateway
- **Technologie**: Kong ou Nginx
- **Rôle**: Point d'entrée unique, routage, authentification, rate limiting
- **Port**: 8080

### 2. Auth Service (Port 3001)
**Responsabilités**:
- Inscription/connexion des utilisateurs
- Gestion des tokens JWT
- Validation des sessions
- Profils utilisateur

**Base de données**: SQLite (users.db)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    elo_rating INTEGER DEFAULT 1200
);
```

### 3. Game Service (Port 3002)
**Responsabilités**:
- Logique du jeu Pong
- Gestion des parties en temps réel
- Matchmaking
- Statistiques de jeu

**Technologies**:
- Node.js + Express
- Socket.IO pour temps réel
- Canvas API pour le rendu

**Base de données**: SQLite (games.db)
```sql
CREATE TABLE games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    winner_id INTEGER,
    blockchain_hash VARCHAR(64)
);
```

### 4. Tournament Service (Port 3003)
**Responsabilités**:
- Création et gestion des tournois
- Système d'élimination
- Calendrier des matchs
- Classements

**Base de données**: SQLite (tournaments.db)
```sql
CREATE TABLE tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'registration', -- registration, ongoing, finished
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    start_date DATETIME,
    end_date DATETIME
);

CREATE TABLE tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    eliminated_at DATETIME,
    final_position INTEGER,
    FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
);
```

### 5. Blockchain Service (Port 3004)
**Responsabilités**:
- Stockage immutable des résultats
- Vérification de l'intégrité
- Historique des parties

**Technologie**: Blockchain personnalisée ou Ethereum privé

```javascript
// Structure d'un bloc
{
    index: number,
    timestamp: number,
    data: {
        gameId: string,
        player1: string,
        player2: string,
        score: string,
        winner: string
    },
    previousHash: string,
    hash: string,
    nonce: number
}
```

### 6. WebSocket Server
**Responsabilités**:
- Communication temps réel
- Synchronisation du jeu
- Chat en jeu
- Notifications

## Structure des dossiers

```
pong-microservices/
├── api-gateway/
│   ├── nginx.conf
│   └── Dockerfile
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── database/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── game-service/
│   │   ├── src/
│   │   ├── public/
│   │   ├── database/
│   │   └── Dockerfile
│   ├── tournament-service/
│   │   ├── src/
│   │   ├── database/
│   │   └── Dockerfile
│   └── blockchain-service/
│       ├── src/
│       ├── blockchain/
│       └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Technologies recommandées

### Backend
- **Node.js** + Express pour les services
- **Socket.IO** pour le WebSocket
- **SQLite** pour les bases de données
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe

### Frontend
- **React** ou **Vue.js**
- **Canvas API** pour le rendu du jeu
- **Socket.IO Client** pour temps réel
- **Axios** pour les requêtes HTTP

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** comme reverse proxy
- **PM2** pour la gestion des processus

## Configuration Docker Compose

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:80"
    depends_on:
      - auth-service
      - game-service
      - tournament-service

  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    volumes:
      - ./data/auth:/app/database
    environment:
      - JWT_SECRET=your-secret-key

  game-service:
    build: ./services/game-service
    ports:
      - "3002:3002"
    volumes:
      - ./data/games:/app/database

  tournament-service:
    build: ./services/tournament-service
    ports:
      - "3003:3003"
    volumes:
      - ./data/tournaments:/app/database

  blockchain-service:
    build: ./services/blockchain-service
    ports:
      - "3004:3004"
    volumes:
      - ./data/blockchain:/app/blockchain

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api-gateway
```

## APIs REST principales

### Auth Service
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil utilisateur
- `PUT /auth/profile` - Mise à jour profil

### Game Service
- `POST /games/create` - Créer une partie
- `POST /games/join/:id` - Rejoindre une partie
- `GET /games/history` - Historique des parties
- `GET /games/stats` - Statistiques joueur

### Tournament Service
- `POST /tournaments` - Créer un tournoi
- `POST /tournaments/:id/join` - S'inscrire à un tournoi
- `GET /tournaments` - Liste des tournois
- `GET /tournaments/:id/bracket` - Bracket du tournoi

## Sécurité

1. **Authentification JWT** sur tous les endpoints
2. **Validation des inputs** avec Joi ou similaire
3. **Rate limiting** sur l'API Gateway
4. **CORS** configuré correctement
5. **HTTPS** en production
6. **Sanitisation** des données utilisateur

## Évolutivité

1. **Load balancing** horizontal
2. **Cache Redis** pour les sessions
3. **Message queues** (RabbitMQ) pour communication inter-services
4. **Monitoring** avec Prometheus + Grafana
5. **Logging centralisé** avec ELK Stack

Cette architecture vous permettra de développer progressivement chaque service de manière indépendante tout en maintenant une cohérence globale.