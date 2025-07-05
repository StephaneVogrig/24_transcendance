#!/bin/bash

# Script de diagnostic pour les problèmes de build
echo "🔍 Diagnostic des problèmes de build"
echo "===================================="

# Fonction pour vérifier un service
check_service() {
    local service_path=$1
    local service_name=$(basename "$service_path")
    
    echo ""
    echo "📋 Vérification de $service_name..."
    
    # Vérifier si le répertoire existe
    if [ ! -d "$service_path" ]; then
        echo "  ❌ Répertoire introuvable : $service_path"
        return 1
    fi
    
    # Vérifier package.json
    if [ ! -f "$service_path/package.json" ]; then
        echo "  ❌ package.json manquant"
        return 1
    else
        echo "  ✅ package.json présent"
        
        # Vérifier la syntaxe JSON
        if ! node -e "JSON.parse(require('fs').readFileSync('$service_path/package.json', 'utf8'))" 2>/dev/null; then
            echo "  ❌ package.json invalide (erreur de syntaxe JSON)"
            return 1
        else
            echo "  ✅ package.json valide"
        fi
    fi
    
    # Vérifier package-lock.json
    if [ ! -f "$service_path/package-lock.json" ]; then
        echo "  ⚠️  package-lock.json manquant (requis pour npm ci)"
    else
        echo "  ✅ package-lock.json présent"
    fi
    
    # Vérifier Dockerfile
    if [ ! -f "$service_path/Dockerfile" ]; then
        echo "  ❌ Dockerfile manquant"
    else
        echo "  ✅ Dockerfile présent"
    fi
    
    # Vérifier Dockerfile.prod
    if [ ! -f "$service_path/Dockerfile.prod" ]; then
        echo "  ❌ Dockerfile.prod manquant"
    else
        echo "  ✅ Dockerfile.prod présent"
        
        # Vérifier quelle commande npm est utilisée
        if grep -q "npm ci" "$service_path/Dockerfile.prod"; then
            echo "  📝 Utilise npm ci (nécessite package-lock.json)"
        elif grep -q "npm install" "$service_path/Dockerfile.prod"; then
            echo "  📝 Utilise npm install"
        fi
    fi
}

# Vérifier les prérequis
echo "🔧 Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo "  ❌ Node.js n'est pas installé"
else
    echo "  ✅ Node.js installé : $(node --version)"
fi

if ! command -v npm &> /dev/null; then
    echo "  ❌ npm n'est pas installé"
else
    echo "  ✅ npm installé : $(npm --version)"
fi

if ! command -v docker &> /dev/null; then
    echo "  ❌ Docker n'est pas installé"
else
    echo "  ✅ Docker installé : $(docker --version)"
fi

# Vérifier Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "  ✅ docker-compose installé : $(docker-compose --version)"
elif docker compose version &> /dev/null; then
    echo "  ✅ docker compose installé : $(docker compose version)"
else
    echo "  ❌ Docker Compose n'est pas installé"
fi

# Vérifier les services backend
echo ""
echo "🏗️  Vérification des services backend..."

for service_dir in backend/*/; do
    if [ -d "$service_dir" ]; then
        check_service "$service_dir"
    fi
done

# Vérifier le frontend
echo ""
echo "🎨 Vérification du frontend..."
check_service "frontend"

# Vérifier les fichiers de configuration
echo ""
echo "⚙️  Vérification de la configuration..."

if [ ! -f ".env" ]; then
    echo "  ❌ Fichier .env manquant"
else
    echo "  ✅ Fichier .env présent"
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "  ❌ docker-compose.yml manquant"
else
    echo "  ✅ docker-compose.yml présent"
fi

if [ ! -f "docker-compose.prod.yml" ]; then
    echo "  ❌ docker-compose.prod.yml manquant"
else
    echo "  ✅ docker-compose.prod.yml présent"
fi

if [ ! -f "Makefile" ]; then
    echo "  ❌ Makefile manquant"
else
    echo "  ✅ Makefile présent"
fi

echo ""
echo "📊 Résumé du diagnostic :"
echo "========================"

# Compter les services avec package-lock.json
lockfiles_count=$(find backend frontend -name "package-lock.json" | wc -l)
total_services=$(find backend frontend -name "package.json" | wc -l)

echo "  📦 Services avec package-lock.json : $lockfiles_count/$total_services"

if [ $lockfiles_count -lt $total_services ]; then
    echo ""
    echo "💡 Recommandations :"
    echo "  - Exécutez './generate-lockfiles.sh' pour générer les package-lock.json manquants"
    echo "  - Ou utilisez les Dockerfiles modifiés avec 'npm install' au lieu de 'npm ci'"
fi

echo ""
echo "✅ Diagnostic terminé !"
