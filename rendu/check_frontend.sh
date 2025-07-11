#!/bin/bash

echo "=== Vérification Complète du Frontend ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# 1. Vérifier les certificats sur l'hôte
echo "1. Certificats SSL sur l'hôte:"
if [ -d "ssl" ]; then
    ls -la ssl/
    if [ -f "ssl/localhost.pem" ] && [ -f "ssl/localhost-key.pem" ]; then
        echo "  ✓ Certificats présents"
    else
        echo "  ✗ Certificats manquants"
    fi
else
    echo "  ✗ Dossier ssl/ non trouvé"
fi

echo ""

# 2. Vérifier l'état du container
echo "2. État du container frontend:"
FRONTEND_STATUS=$(docker compose ps frontend --format "{{.State}}")
echo "  État: $FRONTEND_STATUS"

if [ "$FRONTEND_STATUS" != "running" ]; then
    echo "  ⚠ Container non démarré, tentative de démarrage..."
    docker compose up -d frontend
    sleep 10
fi

echo ""

# 3. Vérifier les logs de démarrage
echo "3. Logs de démarrage nginx:"
docker compose logs --tail=20 frontend | grep -E "(error|Error|nginx|ready|listening)"

echo ""

# 4. Vérifier les certificats dans le container
echo "4. Vérification dans le container:"
if docker compose ps | grep -q "frontend.*Up"; then
    echo "  Certificats dans le container:"
    docker compose exec frontend ls -la /etc/ssl/certs/localhost.pem 2>/dev/null && echo "    ✓ Certificat public trouvé" || echo "    ✗ Certificat public manquant"
    docker compose exec frontend ls -la /etc/ssl/private/localhost-key.pem 2>/dev/null && echo "    ✓ Clé privée trouvée" || echo "    ✗ Clé privée manquante"
    
    echo "  Test de configuration nginx:"
    docker compose exec frontend nginx -t 2>&1 || echo "    ✗ Configuration nginx invalide"
    
    echo "  Processus nginx:"
    docker compose exec frontend ps aux | grep nginx
else
    echo "  ✗ Container frontend non accessible"
fi

echo ""

# 5. Test de connectivité réseau
echo "5. Tests de connectivité:"
echo -n "  Port 8443 local: "
nc -z localhost 8443 2>/dev/null && echo "✓ Ouvert" || echo "✗ Fermé"

echo -n "  Port 8080 local: "
nc -z localhost 8080 2>/dev/null && echo "✓ Ouvert" || echo "✗ Fermé"

echo -n "  Container frontend ping: "
docker compose exec frontend ping -c 1 127.0.0.1 >/dev/null 2>&1 && echo "✓ Réseau OK" || echo "✗ Problème réseau"

echo ""

# 6. Test HTTP/HTTPS
echo "6. Tests HTTP/HTTPS:"
echo "  Test HTTPS (curl détaillé):"
curl -s -k -v https://localhost:8443 2>&1 | head -10 || echo "    Connexion impossible"

echo ""
echo "  Test HTTP (curl):"
curl -s -v http://localhost:8080 2>&1 | head -5 || echo "    Connexion impossible"

echo ""
echo "=== Fin de la vérification ==="
echo ""
echo "Si le frontend ne démarre toujours pas, exécutez:"
echo "  ./restart_frontend.sh"
