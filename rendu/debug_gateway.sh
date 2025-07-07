#!/bin/bash

echo "=== Diagnostic Gateway Transcendance ==="
echo ""

# Vérifier l'état des containers
echo "1. État des containers Docker:"
docker compose ps
echo ""

# Vérifier les logs du gateway
echo "2. Logs récents du gateway:"
docker compose logs --tail=20 gateway
echo ""

# Tester la connectivité vers le gateway
echo "3. Test de connectivité gateway (port 3000):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "ERREUR: Gateway non accessible"
echo ""

# Vérifier les ports utilisés
echo "4. Ports utilisés sur le système:"
netstat -tlnp | grep -E ':300[0-8]' || echo "Aucun service détecté sur les ports 3000-3008"
echo ""

# Vérifier les logs de tous les services backend
echo "5. État des services backend:"
for service in authentification blockchain database game matchmaking scores tournament websocket; do
    echo "--- Logs de $service ---"
    docker compose logs --tail=5 $service
    echo ""
done

# Tester l'accessibilité des services depuis le container gateway
echo "6. Test de connectivité interne (depuis le container gateway):"
docker compose exec gateway sh -c "
    echo 'Test ping vers les services backend:'
    for service in authentification blockchain database game matchmaking scores tournament websocket; do
        echo -n \"$service: \"
        ping -c 1 -W 1 $service >/dev/null 2>&1 && echo 'OK' || echo 'FAIL'
    done
"
echo ""

echo "=== Fin du diagnostic ==="
