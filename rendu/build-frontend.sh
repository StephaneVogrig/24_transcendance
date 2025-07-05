#!/bin/bash

# Script de build avec gestion des erreurs Auth0
echo "🏗️  Build du frontend avec gestion Auth0 optionnelle"
echo "================================================="

cd frontend

# Vérifier si Auth0 est disponible
if npm list @auth0/auth0-spa-js > /dev/null 2>&1; then
    echo "✅ Auth0 module disponible"
    AUTH0_AVAILABLE=true
else
    echo "⚠️  Auth0 module non disponible - build en mode fallback"
    AUTH0_AVAILABLE=false
fi

# Essayer d'installer les dépendances manquantes
echo "📦 Installation des dépendances..."
npm install

# Vérifier à nouveau après installation
if npm list @auth0/auth0-spa-js > /dev/null 2>&1; then
    echo "✅ Auth0 module installé avec succès"
    AUTH0_AVAILABLE=true
else
    echo "⚠️  Auth0 toujours non disponible - continuons sans"
    AUTH0_AVAILABLE=false
fi

# Build avec gestion d'erreur
echo "🔨 Build de l'application..."

if npm run build; then
    echo "✅ Build réussi !"
    
    if [ "$AUTH0_AVAILABLE" = false ]; then
        echo ""
        echo "⚠️  ATTENTION: L'application a été buildée sans Auth0"
        echo "   - La connexion OAuth ne sera pas disponible"
        echo "   - Seule la connexion traditionnelle fonctionnera"
        echo "   - Pour activer Auth0, installez: npm install @auth0/auth0-spa-js"
    fi
else
    echo "❌ Erreur de build"
    echo ""
    echo "💡 Solutions possibles:"
    echo "1. Vérifier les erreurs TypeScript dans les logs ci-dessus"
    echo "2. Installer les dépendances manquantes: npm install"
    echo "3. Vérifier la syntaxe des fichiers modifiés récemment"
    echo "4. Exécuter: npm run dev pour voir les erreurs en détail"
    
    exit 1
fi

cd ..
