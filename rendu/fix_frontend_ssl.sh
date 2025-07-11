#!/bin/bash

echo "=== Correction du Frontend SSL ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

echo "1. Arrêt du frontend en erreur..."
docker compose stop frontend

echo "2. Suppression du container et de l'image pour reconstruction complète..."
docker compose rm -f frontend
docker image rm rendu_frontend 2>/dev/null || echo "  Image déjà supprimée"

echo "3. Vérification des certificats SSL..."
if [ -f "ssl/localhost.pem" ] && [ -f "ssl/localhost-key.pem" ]; then
    echo "  ✓ Certificats SSL trouvés"
    ls -la ssl/localhost*.pem
else
    echo "  ✗ Certificats SSL manquants - régénération..."
    mkdir -p ssl
    cd ssl
    mkcert localhost || openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj '/CN=localhost'
    cd ..
fi

echo ""
echo "4. Reconstruction du frontend avec le nouveau contexte..."
echo "   (Le contexte de build est maintenant le répertoire racine)"
docker compose build --no-cache frontend

echo ""
echo "5. Démarrage du frontend..."
docker compose up -d frontend

echo ""
echo "6. Attente du démarrage (15 secondes)..."
sleep 15

echo ""
echo "7. Vérification du statut:"
docker compose ps frontend

echo ""
echo "8. Logs récents (pour vérifier l'absence d'erreurs SSL):"
docker compose logs --tail=10 frontend

echo ""
echo "9. Test de connectivité:"
echo -n "  HTTPS (8443): "
curl -s -k -o /dev/null -w "%{http_code}" https://localhost:8443 2>/dev/null && echo " ✓" || echo " ✗"

echo -n "  HTTP (8080): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null && echo " ✓" || echo " ✗"

echo ""
echo "=== Correction terminée ==="
echo ""
echo "Le frontend devrait maintenant être accessible sur:"
echo "  HTTPS: https://localhost:8443"
echo "  HTTP:  http://localhost:8080 (redirection vers HTTPS)"
echo ""
echo "Si le problème persiste, vérifiez les logs avec:"
echo "  docker compose logs frontend"
