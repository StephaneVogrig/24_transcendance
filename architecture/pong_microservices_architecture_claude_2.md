# Architecture Microservices - Jeu Pong

## Structure générale du projet

```
pong-game/
├── frontend/                 # Application web TypeScript + Tailwind
├── services/                # Microservices backend
│   ├── auth-service/        # Authentification et gestion utilisateurs
│   ├── game-service/        # Logique de jeu et sessions
│   ├── score-service/       # Gestion des scores et statistiques
│   └── websocket-service/   # Communication temps réel
├── gateway/                 # API Gateway (point d'entrée unique)
├── database/               # Scripts et migrations SQLite
├── docker-compose.yml      # Orchestration des services
└── shared/                 # Types TypeScript partagés
```

## Frontend (Client Web)

### Structure du frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── GameCanvas.tsx    # Canvas de jeu principal
│   │   │   ├── GameControls.tsx  # Contrôles de jeu
│   │   │   └── GameUI.tsx        # Interface utilisateur du jeu
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Dashboard/
│   │   │   ├── Leaderboard.tsx
│   │   │   └── PlayerStats.tsx
│   │   └── Common/
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   ├── services/
│   │   ├── api.ts              # Client HTTP pour REST API
│   │   ├── websocket.ts        # Client WebSocket
│   │   └── gameEngine.ts       # Logique client du jeu
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGame.ts
│   │   └── useWebSocket.ts
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   ├── utils/
│   │   └── constants.ts
│   └── styles/
│       └── globals.css         # Tailwind CSS
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Technologies frontend
- **Framework** : Vite + React/Vue (au choix)
- **Styling** : Tailwind CSS
- **Langage** : TypeScript
- **Communication** : 
  - Axios pour les appels REST
  - WebSocket natif pour le temps réel
- **State Management** : Context API ou Zustand (léger)

## Architecture des Microservices

### 1. API Gateway
**Port : 3000**
- Point d'entrée unique pour toutes les requêtes
- Routage vers les microservices appropriés
- Gestion de l'authentification centralisée
- Rate limiting et monitoring

### 2. Auth Service
**Port : 3001**
- Inscription/Connexion des utilisateurs
- Génération et validation des JWT tokens
- Gestion des profils utilisateurs
- Endpoints :
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/profile`
  - `PUT /auth/profile`

### 3. Game Service
**Port : 3002**
- Création et gestion des parties
- Logique de jeu côté serveur
- Validation des mouvements
- Endpoints :
  - `POST /games` (créer une partie)
  - `GET /games/:id` (détails d'une partie)
  - `PUT /games/:id/join` (rejoindre une partie)
  - `DELETE /games/:id` (quitter/terminer)

### 4. Score Service
**Port : 3003**
- Enregistrement des scores
- Calcul des statistiques
- Leaderboards
- Endpoints :
  - `POST /scores` (enregistrer un score)
  - `GET /scores/leaderboard`
  - `GET /scores/player/:id`
  - `GET /scores/stats/:playerId`

### 5. WebSocket Service
**Port : 3004**
- Communication temps réel pour le gameplay
- Synchronisation des positions de balle et raquettes
- Gestion des rooms de jeu
- Events :
  - `game:join`, `game:leave`
  - `paddle:move`, `ball:update`
  - `score:update`, `game:end`

## Base de données SQLite

### Tables principales
```sql
-- Utilisateurs
users (id, username, email, password_hash, created_at, updated_at)

-- Parties de jeu
games (id, player1_id, player2_id, status, created_at, finished_at)

-- Scores individuels par partie
game_scores (id, game_id, player_id, score, created_at)

-- Statistiques globales des joueurs
player_stats (player_id, games_played, games_won, total_score, avg_score)
```

## Communication entre services

### Patterns de communication
1. **HTTP REST** : Pour les opérations CRUD standard
2. **WebSocket** : Pour le gameplay temps réel
3. **Event Bus** (optionnel) : Pour la communication asynchrone entre services

### Flux de données typique
1. Client → Gateway → Auth Service (authentification)
2. Client → Gateway → Game Service (créer/rejoindre partie)
3. Client ↔ WebSocket Service (gameplay temps réel)
4. WebSocket Service → Score Service (enregistrer scores)

## Configuration Docker

### docker-compose.yml structure
```yaml
services:
  gateway:
    build: ./gateway
    ports: ["3000:3000"]
  
  auth-service:
    build: ./services/auth-service
    ports: ["3001:3001"]
  
  game-service:
    build: ./services/game-service
    ports: ["3002:3002"]
  
  # ... autres services
  
  database:
    image: sqlite:latest
    volumes: ["./data:/data"]
```

## Points d'évolution

### Phase 1 (MVP)
- Authentification basique
- Partie 1v1 locale
- Scores simples

### Phase 2 (Extension)
- Matchmaking automatique
- Spectateurs
- Replay des parties
- Tournois

### Phase 3 (Avancé)
- IA pour jouer contre l'ordinateur
- Classement ELO
- Customisation des raquettes
- Mode multijoueur (4 joueurs)

## Avantages de cette architecture

1. **Scalabilité** : Chaque service peut être scalé indépendamment
2. **Maintenabilité** : Séparation claire des responsabilités
3. **Déployabilité** : Services déployables individuellement
4. **Résilience** : Panne d'un service n'affecte pas les autres
5. **Évolutivité** : Ajout facile de nouvelles fonctionnalités

Cette architecture vous permet de commencer simple et d'évoluer progressivement selon vos besoins.