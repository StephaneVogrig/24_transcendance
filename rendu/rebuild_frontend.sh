#!/bin/bash

echo "=== Régénération Complète du Frontend HTTPS ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# 1. Arrêter et supprimer le container frontend
echo "1. Nettoyage du container frontend..."
docker compose stop frontend
docker compose rm -f frontend

# 2. Supprimer l'image pour forcer la reconstruction
echo "2. Suppression de l'image frontend..."
docker image rm rendu_frontend 2>/dev/null || echo "  Image déjà supprimée"

# 3. Régénérer les certificats SSL
echo "3. Régénération des certificats SSL..."
rm -rf ssl/
mkdir -p ssl
cd ssl

# Vérifier si mkcert est installé
if command -v mkcert >/dev/null 2>&1; then
    echo "  Génération avec mkcert..."
    mkcert localhost
    echo "  ✓ Certificats générés"
else
    echo "  ⚠ mkcert non trouvé, génération avec openssl..."
    openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj '/CN=localhost'
    echo "  ✓ Certificats générés avec openssl"
fi

cd ..

# Vérifier les certificats
echo "4. Vérification des certificats:"
ls -la ssl/
openssl x509 -in ssl/localhost.pem -text -noout | grep -E "(Subject:|Issuer:|Not After)" || echo "  Erreur de lecture du certificat"

# 5. Reconstruction complète du frontend
echo ""
echo "5. Reconstruction du frontend..."
docker compose build --no-cache frontend

# 6. Démarrage du frontend
echo ""
echo "6. Démarrage du frontend..."
docker compose up -d frontend

# 7. Attendre et vérifier
echo ""
echo "7. Attente du démarrage (20 secondes)..."
sleep 20

# 8. Vérifications finales
echo ""
echo "8. Vérifications finales:"

echo -n "  Container status: "
docker compose ps frontend --format "{{.State}}" || echo "Erreur"

echo -n "  Port 8443: "
curl -s -k -o /dev/null -w "%{http_code}" https://localhost:8443 2>/dev/null || echo "ERREUR"

echo -n "  Port 8080: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "ERREUR"

echo ""
echo "9. Logs récents:"
docker compose logs --tail=15 frontend

echo ""
echo "=== Régénération terminée ==="
echo ""
echo "URLs à tester:"
echo "  HTTPS: https://localhost:8443"
echo "  HTTP:  http://localhost:8080 (redirection)"
echo ""
echo "Si le problème persiste, vérifiez:"
echo "  - Firewall/iptables bloquant les ports 8080/8443"
echo "  - Conflit avec d'autres services sur ces ports"
echo "  - Permissions Docker"
