#!/bin/bash

echo "=== Test du Flow Google OAuth Complet ==="
echo ""

# Vérifier que tous les services sont actifs
echo "1. Vérification des services..."
echo -n "  Frontend HTTPS: "
curl -s -k https://localhost:8443 >/dev/null && echo "✓" || echo "✗"

echo -n "  Gateway: "
curl -s http://localhost:3000/api/health >/dev/null && echo "✓" || echo "✗"

echo -n "  Service Auth: "
curl -s http://localhost:3001 >/dev/null && echo "✓" || echo "✗"

echo ""
echo "2. Test des routes d'authentification..."

# Tester la route de callback Google OAuth
echo -n "  Route de callback OAuth: "
curl -s "http://localhost:3000/api/auth/callback" && echo " ✓" || echo " ✗"

# Tester la redirection vers Google
echo -n "  Redirection Google OAuth: "
GOOGLE_URL=$(curl -s -o /dev/null -w "%{redirect_url}" "http://localhost:3000/api/auth/google")
if [[ $GOOGLE_URL == *"accounts.google.com"* ]]; then
    echo "✓"
    echo "    URL: $GOOGLE_URL"
else
    echo "✗"
fi

echo ""
echo "3. Test CORS depuis le frontend..."
echo -n "  CORS Gateway: "
curl -s -H "Origin: https://localhost:8443" http://localhost:3000/api/health >/dev/null && echo "✓" || echo "✗"

echo -n "  CORS Auth Service: "
curl -s -H "Origin: https://localhost:8443" http://localhost:3000/api/auth/ >/dev/null && echo "✓" || echo "✗"

echo ""
echo "4. Variables d'environnement OAuth..."
if [ -f .env ]; then
    echo "  Fichier .env trouvé"
    grep -q "GOOGLE_CLIENT_ID" .env && echo "  ✓ GOOGLE_CLIENT_ID configuré" || echo "  ✗ GOOGLE_CLIENT_ID manquant"
    grep -q "GOOGLE_CLIENT_SECRET" .env && echo "  ✓ GOOGLE_CLIENT_SECRET configuré" || echo "  ✗ GOOGLE_CLIENT_SECRET manquant"
    grep -q "GOOGLE_CALLBACK_URL" .env && echo "  ✓ GOOGLE_CALLBACK_URL configuré" || echo "  ✗ GOOGLE_CALLBACK_URL manquant"
    
    echo "  Callback URL actuel:"
    grep "GOOGLE_CALLBACK_URL" .env | sed 's/.*=/    /'
else
    echo "  ✗ Fichier .env non trouvé"
fi

echo ""
echo "5. Instructions pour tester manuellement:"
echo "  1. Ouvrir https://localhost:8443 dans votre navigateur"
echo "  2. Cliquer sur le bouton de connexion Google OAuth"
echo "  3. Vérifier que la redirection fonctionne vers Google"
echo "  4. Après autorisation, vérifier le retour vers l'application"
echo ""

echo "6. URLs importantes:"
echo "  Frontend: https://localhost:8443"
echo "  Gateway: http://localhost:3000"
echo "  Auth Service: http://localhost:3001"
echo "  Google OAuth: http://localhost:3000/api/auth/google"
echo "  OAuth Callback: http://localhost:3001/callback"

echo ""
echo "=== Test terminé ==="
