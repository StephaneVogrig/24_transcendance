#!/bin/bash

echo "🧪 Script de test de déconnexion Auth0"
echo "======================================"

echo "1. Vérification de l'état du service d'authentification..."
curl -s http://localhost:3001/api/auth/status | jq '.' || echo "Service d'authentification non disponible"

echo -e "\n2. Instructions pour tester la déconnexion manuellement :"
echo "   - Ouvrez http://localhost:5173/login"
echo "   - Connectez-vous avec Auth0"
echo "   - Allez sur http://localhost:5173/user-status"
echo "   - Cliquez sur 'Se Déconnecter'"
echo "   - Vérifiez que vous êtes redirigé et déconnecté"

echo -e "\n3. Test automatique via console du navigateur :"
echo "   - Ouvrez les DevTools (F12)"
echo "   - Dans la console, tapez : testLogout()"
echo "   - Observez les logs de déconnexion"

echo -e "\n4. Vérification des données localStorage :"
echo "   - Avant déconnexion : localStorage devrait contenir des clés Auth0"
echo "   - Après déconnexion : localStorage devrait être vide"

echo -e "\n5. URLs de test utiles :"
echo "   - Statut utilisateur : http://localhost:5173/user-status"
echo "   - Page de connexion : http://localhost:5173/login"
echo "   - Choix de jeu : http://localhost:5173/choice-game"

echo -e "\n✅ Script de test prêt. Suivez les instructions ci-dessus pour tester la déconnexion."
