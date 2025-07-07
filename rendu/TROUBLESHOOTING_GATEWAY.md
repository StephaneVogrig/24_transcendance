# Guide de Résolution - Gateway Transcendance

## Problème
Le gateway n'est plus accessible sur le port 3000 après les modifications récentes.

## Diagnostic

### 1. Vérification rapide
```bash
# Depuis le répertoire /home/smortemo/Documents/24_transcendance/rendu
./debug_gateway.sh
```

### 2. Test de configuration
```bash
./test_gateway_config.sh
```

### 3. Test du gateway simplifié
```bash
./test_simple_gateway.sh
```

## Solutions possibles

### Solution 1: Redémarrage complet avec ordre correct
```bash
./restart_services.sh
```

### Solution 2: Vérification des dépendances
Le gateway dépend de tous les autres services backend. Si un service ne démarre pas, le gateway peut ne pas démarrer correctement.

1. Vérifier que tous les services backend démarrent individuellement :
```bash
docker compose up -d database
sleep 10
docker compose up -d authentification
docker compose up -d blockchain
# ... etc pour chaque service
```

2. Ensuite démarrer le gateway :
```bash
docker compose up -d gateway
```

### Solution 3: Correction du problème top-level await
Le fichier `backend/gateway/src/server.ts` a été modifié pour supprimer le `await` au niveau racine qui pourrait causer des problèmes de démarrage.

### Solution 4: Test avec le gateway simplifié
Si le gateway principal ne fonctionne toujours pas, utiliser le gateway simplifié pour vérifier que le problème n'est pas lié à la configuration réseau Docker :

```bash
./test_simple_gateway.sh
```

### Solution 5: Vérification manuelle des ports
```bash
# Vérifier les ports utilisés
netstat -tlnp | grep :3000

# Vérifier l'état des containers
docker compose ps

# Vérifier les logs du gateway
docker compose logs gateway
```

## Vérifications post-résolution

1. **Test de connectivité gateway :**
```bash
curl http://localhost:3000/api/health
```

2. **Test CORS depuis le frontend :**
```bash
curl -H "Origin: https://localhost:8443" http://localhost:3000/api/test
```

3. **Test du flow complet :**
- Frontend HTTPS : https://localhost:8443
- Gateway HTTP : http://localhost:3000/api/health
- Service Auth : http://localhost:3001 (via gateway /api/auth/)

## Problèmes fréquents et solutions

### Gateway ne démarre pas
- Vérifier les logs : `docker compose logs gateway`
- Problème de syntaxe TypeScript : `npx tsc --noEmit backend/gateway/src/server.ts`
- Problème de dépendances : `docker compose up -d` sans le gateway d'abord

### Gateway démarre mais n'est pas accessible
- Vérifier le mapping de port dans docker-compose.yml
- Vérifier que le service écoute sur 0.0.0.0:3000
- Vérifier qu'aucun firewall ne bloque le port

### Gateway accessible mais CORS ne fonctionne pas
- Vérifier la configuration CORS dans server.ts
- L'origine `https://localhost:8443` doit être dans la liste des origines autorisées

### Services backend non accessibles depuis le gateway
- Vérifier que tous les services backend sont démarrés
- Vérifier la connectivité réseau Docker : `docker compose exec gateway ping authentification`

## Configuration actuelle

- **Frontend HTTPS :** https://localhost:8443 (nginx + SSL)
- **Frontend HTTP :** http://localhost:8080 (redirection vers HTTPS)
- **Gateway :** http://localhost:3000 (point d'entrée API)
- **Services backend :** http://localhost:3001-3008 (via gateway)

Le frontend accède directement au gateway via HTTP (pas de proxy nginx vers le gateway).
