# � Container en Boucle de Redémarrage

## Situation Actuelle

Le container `rendu-authentification-1` est en état `Restarting (1)`, ce qui signifie qu'il crash continuellement et Docker le redémarre automatiquement.

## 🔍 Causes Possibles

### 1. **Erreur dans les Variables d'Environnement**
```bash
# Vérifiez votre fichier .env
cat .env | grep GOOGLE
```
Les variables doivent être définies sans guillemets :
```bash
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
```

### 2. **Erreur de Dépendance**
Le container peut ne pas arriver à installer ou importer une dépendance.

### 3. **Erreur de Port**
Le port 3001 pourrait être déjà utilisé par un autre processus.

### 4. **Erreur de Configuration Fastify**
Un problème dans le code Fastify empêche le démarrage.

## 🛠️ Solutions de Dépannage

### Solution 1: Voir les Logs (Recommandé)
```bash
# Dans un terminal externe (pas VS Code)
docker logs rendu-authentification-1

# Ou pour suivre en temps réel
docker logs -f rendu-authentification-1
```

### Solution 2: Redémarrage Clean
```bash
# Arrêter et supprimer le container
docker stop rendu-authentification-1
docker rm rendu-authentification-1

# Reconstruire l'image
docker-compose build authentification

# Redémarrer
docker-compose up authentification -d
```

### Solution 3: Test avec Service Minimal
Modifier temporairement le Dockerfile pour utiliser le test minimal :
```dockerfile
# Dans Dockerfile, changer la dernière ligne :
CMD ["npm", "run", "dev", "src/test-minimal.ts"]
```

### Solution 4: Vérifier les Ports
```bash
# Voir ce qui utilise le port 3001
lsof -i :3001
netstat -tulpn | grep :3001
```

### Solution 5: Variables d'Environnement
```bash
# Tester sans les variables Google OAuth
# Commentez temporairement dans .env :
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

## 🎯 Action Immédiate

**La première chose à faire** est de voir les logs pour comprendre l'erreur exacte :

1. **Ouvrir un terminal système** (pas VS Code)
2. **Exécuter** : `docker logs rendu-authentification-1`
3. **Identifier l'erreur** dans les logs
4. **Appliquer la solution** correspondante

## 📋 Erreurs Communes et Solutions

### `Cannot find module 'googleapis'`
**Solution** : Reconstruire l'image Docker
```bash
docker-compose build authentification --no-cache
```

### `EADDRINUSE: address already in use`
**Solution** : Un autre processus utilise le port 3001
```bash
kill $(lsof -t -i:3001)
```

### `Invalid client`
**Solution** : Variables Google OAuth incorrectes
```bash
# Vérifier dans Google Cloud Console
# Mettre à jour le .env
```

### `Cannot read properties of undefined`
**Solution** : Variable d'environnement manquante
```bash
# Ajouter toutes les variables requises dans .env
```

## 🔄 Cycle de Test

1. **Voir les logs** → Identifier l'erreur
2. **Appliquer la correction** → Modifier le code/config
3. **Rebuild** → `docker-compose build authentification`
4. **Restart** → `docker-compose up authentification -d`
5. **Test** → `curl http://localhost:3001/api/auth`

Une fois que vous aurez les logs, nous pourrons identifier et corriger le problème exact !
