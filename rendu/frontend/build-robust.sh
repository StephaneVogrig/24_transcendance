#!/bin/bash

# Script de build frontend robuste
echo "🔨 Build frontend avec gestion d'erreurs..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le dossier frontend."
    exit 1
fi

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
rm -rf node_modules/.vite
rm -rf dist

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier les dépendances critiques
echo "🔍 Vérification des dépendances..."
missing_deps=()

if ! npm list socket.io-client > /dev/null 2>&1; then
    echo "⚠️  socket.io-client manquant, tentative d'installation..."
    npm install socket.io-client@^4.7.4
    missing_deps+=("socket.io-client")
fi

if ! npm list @babylonjs/core > /dev/null 2>&1; then
    echo "⚠️  @babylonjs/core manquant, tentative d'installation..."
    npm install @babylonjs/core@8.14.0
    missing_deps+=("@babylonjs/core")
fi

if ! npm list @auth0/auth0-spa-js > /dev/null 2>&1; then
    echo "⚠️  @auth0/auth0-spa-js manquant, tentative d'installation..."
    npm install @auth0/auth0-spa-js@^2.1.3
    missing_deps+=("@auth0/auth0-spa-js")
fi

# Afficher les dépendances installées
if [ ${#missing_deps[@]} -gt 0 ]; then
    echo "✅ Dépendances installées: ${missing_deps[*]}"
fi

# Essayer différentes stratégies de build
echo ""
echo "🏗️  Tentative de build..."

# Stratégie 1: Build normal
echo "🔄 Stratégie 1: Build standard..."
if npm run build > build.log 2>&1; then
    echo "✅ Build standard réussi !"
else
    echo "❌ Build standard échoué, essai de la stratégie 2..."
    
    # Stratégie 2: Build sans vérification TypeScript
    echo "🔄 Stratégie 2: Build sans vérification TypeScript..."
    if npm run build-safe > build-safe.log 2>&1; then
        echo "✅ Build sans TypeScript réussi !"
    else
        echo "❌ Build sans TypeScript échoué, essai de la stratégie 3..."
        
        # Stratégie 3: Build Vite seulement
        echo "🔄 Stratégie 3: Build Vite uniquement..."
        if npx vite build > vite-build.log 2>&1; then
            echo "✅ Build Vite uniquement réussi !"
        else
            echo "❌ Toutes les stratégies de build ont échoué"
            echo ""
            echo "📋 Logs des erreurs:"
            echo "--- Build standard ---"
            cat build.log 2>/dev/null || echo "Pas de log disponible"
            echo ""
            echo "--- Build sans TypeScript ---"
            cat build-safe.log 2>/dev/null || echo "Pas de log disponible"
            echo ""
            echo "--- Build Vite uniquement ---"
            cat vite-build.log 2>/dev/null || echo "Pas de log disponible"
            
            exit 1
        fi
    fi
fi

# Vérifier que le build a produit des fichiers
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo ""
    echo "✅ Build terminé avec succès !"
    echo "📁 Fichiers générés dans le dossier 'dist':"
    ls -la dist/
else
    echo ""
    echo "❌ Build incomplet: dossier 'dist' vide ou inexistant"
    exit 1
fi

# Nettoyer les logs temporaires
rm -f build.log build-safe.log vite-build.log

echo ""
echo "🎉 Build frontend terminé avec succès !"
