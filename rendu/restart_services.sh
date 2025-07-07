#!/bin/bash

echo "=== Redémarrage des services Transcendance ==="
echo ""

# Arrêter tous les services
echo "1. Arrêt de tous les services..."
docker compose down

# Reconstruire le gateway et les services qui pourraient avoir des problèmes
echo "2. Reconstruction des services backend..."
docker compose build gateway authentification

# Démarrer les services de base d'abord
echo "3. Démarrage des services de base..."
docker compose up -d database

# Attendre que la base soit prête
echo "4. Attente de la base de données..."
sleep 10

# Démarrer les autres services backend
echo "5. Démarrage des services backend..."
docker compose up -d authentification blockchain game matchmaking scores tournament websocket

# Attendre que les services backend soient prêts
echo "6. Attente des services backend..."
sleep 15

# Démarrer le gateway
echo "7. Démarrage du gateway..."
docker compose up -d gateway

# Attendre que le gateway soit prêt
echo "8. Attente du gateway..."
sleep 10

# Démarrer le frontend
echo "9. Démarrage du frontend..."
docker compose up -d frontend

# Vérifier l'état final
echo "10. Vérification de l'état final..."
docker compose ps

echo ""
echo "Test de connectivité:"
curl -s http://localhost:3000/api/health && echo " ✓ Gateway accessible" || echo " ✗ Gateway non accessible"
curl -s -k https://localhost:8443 && echo " ✓ Frontend HTTPS accessible" || echo " ✗ Frontend HTTPS non accessible"

echo ""
echo "=== Redémarrage terminé ==="
