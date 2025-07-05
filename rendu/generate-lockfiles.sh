#!/bin/bash

# Script pour générer les package-lock.json manquants
echo "🔧 Génération des package-lock.json manquants..."

# Liste des services backend
BACKEND_SERVICES=(
    "authentification"
    "blockchain" 
    "database"
    "game"
    "gateway"
    "matchmaking"
    "scores"
    "websocket"
)

# Vérifier Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    echo "Veuillez installer Node.js : https://nodejs.org/"
    exit 1
fi

echo "📦 Génération des package-lock.json pour les services backend..."

for service in "${BACKEND_SERVICES[@]}"; do
    SERVICE_DIR="backend/$service"
    
    if [ -d "$SERVICE_DIR" ]; then
        echo "  🔧 $service..."
        cd "$SERVICE_DIR"
        
        # Supprimer node_modules et package-lock.json existants
        rm -rf node_modules package-lock.json
        
        # Installer les dépendances (génère package-lock.json)
        npm install
        
        # Revenir au répertoire racine
        cd ../..
        
        echo "  ✅ $service - package-lock.json généré"
    else
        echo "  ⚠️  $service - répertoire introuvable"
    fi
done

echo ""
echo "📦 Génération du package-lock.json pour le frontend..."
cd frontend

# Supprimer node_modules et package-lock.json existants
rm -rf node_modules package-lock.json

# Installer les dépendances
npm install

cd ..

echo "✅ frontend - package-lock.json généré"

echo ""
echo "🔄 Restauration des commandes npm ci dans les Dockerfiles.prod..."

# Restaurer npm ci dans les Dockerfiles.prod
find backend -name "Dockerfile.prod" -exec sed -i 's/npm install --only=production/npm ci --only=production/g' {} \;
sed -i 's/npm install --only=production/npm ci --only=production/g' frontend/Dockerfile.prod

echo "✅ Tous les package-lock.json ont été générés !"
echo "✅ Les Dockerfiles.prod utilisent maintenant npm ci"
echo ""
echo "Vous pouvez maintenant build votre projet en production avec : make prod"
