#!/bin/bash

echo "=== Test du Gateway Simplifié ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# Arrêter le gateway actuel
echo "1. Arrêt du gateway actuel..."
docker compose stop gateway

# Construire et démarrer le gateway simplifié
echo "2. Construction du gateway simplifié..."
docker build -f backend/gateway/Dockerfile.simple -t gateway-simple backend/gateway/

echo "3. Démarrage du gateway simplifié..."
docker run -d --name gateway-simple-test --network rendu_transcendence-network -p 3000:3000 gateway-simple

# Attendre le démarrage
echo "4. Attente du démarrage (10 secondes)..."
sleep 10

# Tester la connectivité
echo "5. Test de connectivité:"
echo -n "  Health check: "
curl -s http://localhost:3000/api/health && echo " ✓" || echo " ✗"

echo -n "  Game info: "
curl -s http://localhost:3000/api/game/info && echo " ✓" || echo " ✗"

echo -n "  CORS test: "
curl -s http://localhost:3000/api/test && echo " ✓" || echo " ✗"

# Afficher les logs
echo ""
echo "6. Logs du gateway simplifié:"
docker logs gateway-simple-test

# Nettoyer
echo ""
echo "7. Nettoyage..."
docker stop gateway-simple-test
docker rm gateway-simple-test

echo ""
echo "=== Test terminé ==="
