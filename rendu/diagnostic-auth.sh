#!/bin/bash

echo "=== Diagnostic du Service d'Authentification ==="
echo ""

# 1. État du container
echo "1. État actuel du container:"
docker ps -a | grep authentification

echo ""
echo "2. Logs récents du container:"
echo "=================================="
docker logs --tail 50 rendu-authentification-1

echo ""
echo "3. Tentative d'arrêt et redémarrage clean:"
echo "=========================================="
docker stop rendu-authentification-1
docker rm rendu-authentification-1

echo ""
echo "4. Reconstruction de l'image:"
echo "============================="
cd /home/smortemo/Documents/24_transcendance/rendu
docker-compose build authentification

echo ""
echo "5. Redémarrage du service:"
echo "========================="
docker-compose up authentification -d

echo ""
echo "6. Attente et vérification:"
echo "=========================="
sleep 5
docker ps | grep authentification

echo ""
echo "7. Nouveaux logs:"
echo "================"
docker logs rendu-authentification-1

echo ""
echo "8. Test de connexion:"
echo "===================="
curl -v http://localhost:3001/api/auth
