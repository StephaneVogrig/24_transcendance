#!/bin/bash

# Script d'installation et de configuration OAuth pour Transcendence
# Ce script installe les dépendances nécessaires et configure l'environnement

echo "🔧 Configuration OAuth pour Transcendence"
echo "=========================================="

# Vérification des prérequis
echo "Vérification des prérequis..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "Veuillez installer Docker : https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    echo "Veuillez installer Docker Compose : https://docs.docker.com/compose/install/"
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Veuillez installer Node.js : https://nodejs.org/"
    exit 1
fi

echo "✅ Tous les prérequis sont installés"

# Installation des dépendances backend
echo ""
echo "📦 Installation des dépendances backend..."
cd backend/authentification
npm install

# Installation des dépendances frontend
echo ""
echo "📦 Installation des dépendances frontend..."
cd ../../frontend
npm install

cd ..

# Vérification du fichier .env
echo ""
echo "🔧 Vérification de la configuration..."

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    echo "Copie du fichier .env.example..."
    cp .env_example .env
fi

# Vérifications des variables Auth0
echo ""
echo "🔍 Vérification de la configuration Auth0..."

# Variables nécessaires
REQUIRED_VARS=(
    "VITE_AUTH0_DOMAIN"
    "VITE_AUTH0_CLIENT_ID"
    "AUTH0_DOMAIN"
    "AUTH0_CLIENT_ID"
    "AUTH0_CLIENT_SECRET"
    "JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env || grep -q "^$var=$" .env || grep -q "^$var=your-.*-here" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "⚠️  Variables manquantes ou non configurées dans .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Veuillez configurer ces variables dans le fichier .env"
    echo "Consultez OAUTH_README.md pour plus d'informations"
else
    echo "✅ Configuration Auth0 complète"
fi

# Instructions de démarrage
echo ""
echo "🚀 Instructions de démarrage:"
echo "1. Configurez vos variables Auth0 dans .env (si pas encore fait)"
echo "2. Lancez l'application avec : make dev"
echo "3. Accédez à l'application sur : http://localhost:1800"
echo ""
echo "📖 Consultez OAUTH_README.md pour la documentation complète"

echo ""
echo "✅ Configuration terminée !"
