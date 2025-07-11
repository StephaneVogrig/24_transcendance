#!/bin/bash

echo "=== Diagnostic Frontend HTTPS ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# Vérifier l'état des containers
echo "1. État des containers:"
docker compose ps | grep -E "(frontend|NAME)"

# Vérifier les logs du frontend
echo ""
echo "2. Logs récents du frontend:"
docker compose logs --tail=15 frontend

# Tester la connectivité
echo ""
echo "3. Tests de connectivité:"
echo -n "  Port 8443 (HTTPS): "
curl -s -k -o /dev/null -w "%{http_code}" https://localhost:8443 2>/dev/null || echo "CONNEXION ÉCHOUÉE"

echo -n "  Port 8080 (HTTP): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "CONNEXION ÉCHOUÉE"

# Vérifier les ports utilisés
echo ""
echo "4. Ports utilisés par Docker:"
docker compose ps --format "table {{.Name}}\t{{.Ports}}" | grep -E "(frontend|NAME)"

# Vérifier les certificats SSL dans le container
echo ""
echo "5. Vérification des certificats SSL:"
if docker compose ps | grep -q "frontend.*Up"; then
    echo "  Certificats dans le container:"
    docker compose exec frontend ls -la /etc/ssl/certs/localhost.pem /etc/ssl/private/localhost-key.pem 2>/dev/null || echo "  ✗ Certificats non trouvés"
    
    echo "  Configuration nginx:"
    docker compose exec frontend nginx -t 2>/dev/null && echo "  ✓ Configuration nginx valide" || echo "  ✗ Configuration nginx invalide"
else
    echo "  ✗ Container frontend non démarré"
fi

echo ""
echo "=== Fin du diagnostic ==="
