#!/bin/bash

echo "=== Redémarrage Frontend HTTPS ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# Arrêter le frontend
echo "1. Arrêt du frontend..."
docker compose stop frontend

# Vérifier que les certificats SSL sont présents sur l'hôte
echo "2. Vérification des certificats SSL sur l'hôte..."
if [ -f "ssl/localhost.pem" ] && [ -f "ssl/localhost-key.pem" ]; then
    echo "  ✓ Certificats SSL trouvés"
    ls -la ssl/localhost*.pem
else
    echo "  ✗ Certificats SSL manquants, régénération..."
    mkdir -p ssl
    cd ssl
    mkcert localhost
    cd ..
fi

# Reconstruire le frontend avec les certificats
echo ""
echo "3. Reconstruction du frontend..."
docker compose build frontend

# Redémarrer le frontend
echo ""
echo "4. Redémarrage du frontend..."
docker compose up -d frontend

# Attendre le démarrage
echo ""
echo "5. Attente du démarrage (15 secondes)..."
sleep 15

# Vérifier les logs
echo ""
echo "6. Logs de démarrage:"
docker compose logs --tail=10 frontend

# Tests de connectivité
echo ""
echo "7. Tests de connectivité:"
echo -n "  HTTPS (8443): "
curl -s -k https://localhost:8443 >/dev/null && echo "✓ Accessible" || echo "✗ Non accessible"

echo -n "  HTTP (8080): "
curl -s http://localhost:8080 >/dev/null && echo "✓ Accessible" || echo "✗ Non accessible"

# Test avec en-têtes détaillés
echo ""
echo "8. Test HTTPS détaillé:"
curl -s -k -I https://localhost:8443 2>/dev/null | head -5 || echo "Connexion impossible"

echo ""
echo "=== URLs pour tester manuellement ==="
echo "Frontend HTTPS: https://localhost:8443"
echo "Frontend HTTP:  http://localhost:8080 (redirection vers HTTPS)"
echo ""
echo "=== Redémarrage terminé ==="
