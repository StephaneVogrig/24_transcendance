#!/bin/bash

echo "🔍 Vérification de la configuration de production..."

# Vérifier que les fichiers nécessaires existent
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant. Copiez .env.example vers .env et configurez-le."
    exit 1
fi

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Vérifier que Docker Compose est disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible"
    exit 1
fi

# Vérifier que les Dockerfiles de production existent
missing_dockerfiles=()

for service in frontend backend/gateway backend/authentification backend/blockchain backend/database backend/game backend/matchmaking backend/scores backend/tournament backend/websocket; do
    if [ ! -f "$service/Dockerfile.prod" ]; then
        missing_dockerfiles+=("$service/Dockerfile.prod")
    fi
done

if [ ${#missing_dockerfiles[@]} -ne 0 ]; then
    echo "❌ Dockerfiles de production manquants :"
    printf '%s\n' "${missing_dockerfiles[@]}"
    exit 1
fi

# Vérifier que docker-compose.prod.yml existe
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Fichier docker-compose.prod.yml manquant"
    exit 1
fi

echo "✅ Tous les fichiers de production sont présents"
echo "✅ Docker et Docker Compose sont disponibles"

# Vérifier que les fichiers JSON sont valides
echo ""
echo "🔍 Validation des fichiers de configuration..."
if ./validate-json.sh > /dev/null 2>&1; then
    echo "✅ Tous les fichiers JSON sont valides"
else
    echo "❌ Certains fichiers JSON contiennent des erreurs"
    echo "   Exécutez: make validate-json pour plus de détails"
fi

echo ""
echo "🚀 Prêt pour le déploiement en production !"
echo ""
echo "Pour valider les configurations :"
echo "  make validate-json"
echo ""
echo "Pour générer les package-lock.json (optionnel) :"
echo "  make generate-locks"
echo ""
echo "Pour déployer en production, utilisez :"
echo "  make production"
echo ""
echo "L'application sera accessible sur http://localhost:8080"
echo ""
echo "Pour voir les logs :"
echo "  make production-logs"
echo ""
echo "Pour arrêter :"
echo "  make production-down"
