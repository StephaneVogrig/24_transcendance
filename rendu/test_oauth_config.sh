#!/bin/bash

echo "=== Test de Configuration Google OAuth ==="
echo ""

cd /home/smortemo/Documents/24_transcendance/rendu

# Afficher la configuration actuelle
echo "1. Configuration actuelle (fichier .env):"
if [ -f .env ]; then
    echo "  GOOGLE_CLIENT_ID: $(grep GOOGLE_CLIENT_ID .env | cut -d'=' -f2)"
    echo "  GOOGLE_REDIRECT_URI: $(grep GOOGLE_REDIRECT_URI .env | cut -d'=' -f2)"
    echo "  GOOGLE_CLIENT_SECRET: [MASQUÉ]"
else
    echo "  ✗ Fichier .env non trouvé"
fi
echo ""

# Redémarrer les services avec la nouvelle configuration
echo "2. Redémarrage des services pour prendre en compte la nouvelle config..."
docker compose restart authentification gateway

echo "3. Attente du redémarrage (15 secondes)..."
sleep 15

# Tester la connectivité des services
echo "4. Test de connectivité:"
echo -n "  Gateway: "
curl -s http://localhost:3000/api/health >/dev/null && echo "✓" || echo "✗"

echo -n "  Service Auth: "
curl -s http://localhost:3000/api/auth/ >/dev/null && echo "✓" || echo "✗"

# Tester les routes Google OAuth
echo ""
echo "5. Test des routes Google OAuth:"

echo -n "  Route login Google: "
RESPONSE=$(curl -s http://localhost:3000/api/auth/google)
if [[ $RESPONSE == *"authUrl"* ]] && [[ $RESPONSE == *"accounts.google.com"* ]]; then
    echo "✓"
    # Extraire et afficher l'URL
    echo "    URL générée: $(echo $RESPONSE | grep -o 'https://accounts.google.com[^"]*' | head -1)"
else
    echo "✗"
    echo "    Réponse: $RESPONSE"
fi

echo -n "  Route callback (test GET vide): "
curl -s http://localhost:3000/api/auth/google/callback >/dev/null && echo "✓ (route accessible)" || echo "✗ (route non accessible)"

# Vérifier les logs pour des erreurs
echo ""
echo "6. Logs récents du service d'authentification:"
docker compose logs --tail=10 authentification

echo ""
echo "7. Logs récents du gateway:"
docker compose logs --tail=5 gateway

echo ""
echo "=== Instructions pour tester manuellement ==="
echo "1. Ouvrir votre navigateur sur https://localhost:8443"
echo "2. Ouvrir les outils de développement (F12)"
echo "3. Cliquer sur le bouton de connexion Google"
echo "4. Vérifier dans l'onglet Réseau que l'appel se fait vers:"
echo "   http://localhost:3000/api/auth/google"
echo "5. Vérifier que la redirection Google inclut le bon callback URL:"
echo "   http://localhost:3000/api/auth/google/callback"
echo ""
echo "Si cela ne fonctionne toujours pas, vérifiez dans la Google Console"
echo "que l'URI de redirection autorisée est bien:"
echo "http://localhost:3000/api/auth/google/callback"
echo ""
echo "=== Test terminé ==="
