# Transcendence Production Deployment

## Configuration de Production

### 0. Préparation (optionnel)

Si vous rencontrez des problèmes de compilation TypeScript :

```bash
make fix-typescript        # Ajuste les configurations TypeScript pour la production
make setup-frontend-prod   # Configure le frontend pour la production
make generate-locks        # Génère les package-lock.json pour optimiser les builds
```

### 1. Configuration des variables d'environnement

Copiez le fichier `.env.example` vers `.env` et modifiez les valeurs selon votre environnement :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations spécifiques :
- Mots de passe sécurisés
- Clés JWT
- Configuration blockchain
- Domaines autorisés pour CORS

### 1.5. Génération des fichiers de verrouillage (optionnel)

Si vous voulez utiliser `npm ci` au lieu de `npm install` dans les Dockerfiles pour des builds plus rapides et reproductibles :

```bash
./generate-lock-files.sh
```

Cela génèrera les `package-lock.json` pour tous les services. Ensuite, vous pouvez remplacer `npm install` par `npm ci` dans les Dockerfiles de production.

### 2. Déploiement

#### Mode Développement
```bash
make up          # Démarrer en mode développement
make down        # Arrêter les services
make reboot      # Redémarrer les services
```

#### Mode Production
```bash
make production           # Démarrer en mode production
make production-down      # Arrêter la production
make production-restart   # Redémarrer la production
make production-logs      # Voir les logs en temps réel
```

**Accès à l'application** : Une fois déployée, l'application sera accessible sur `http://localhost:8080`

### 3. Différences Production vs Développement

#### Mode Développement (`docker-compose.yml`)
- Hot reload activé
- Volumes montés pour le développement
- Serveur Vite en mode développement
- Services TypeScript compilés à la volée

#### Mode Production (`docker-compose.prod.yml`)
- Applications compilées et optimisées
- Nginx pour servir le frontend
- Restart automatique des services
- Images multi-stage optimisées
- Utilisateurs non-root pour la sécurité
- Cache et compression activés

### 4. Architecture Production

- **Frontend** : Nginx servant les fichiers statiques compilés (port 8080)
- **Gateway** : API Gateway compilé (port 3000)
- **Services** : Microservices compilés et optimisés
- **Réseau** : Réseau Docker isolé
- **Sécurité** : Utilisateurs non-root, redémarrages automatiques

### 5. Maintenance

```bash
make clean       # Nettoyer les images Docker inutilisées
make fclean      # Nettoyage complet + volumes
make re          # Reconstruction complète
```

### 6. Surveillance

Pour surveiller les services en production :

```bash
# Logs en temps réel
make production-logs

# Statut des services
docker compose -f docker-compose.prod.yml ps

# Utilisation des ressources
docker stats
```

### 7. Backup et Restauration

N'oubliez pas de sauvegarder :
- Base de données
- Fichiers de configuration
- Données blockchain si applicable

### 8. Mise à jour

Pour mettre à jour l'application :

```bash
git pull
make production-restart
```
