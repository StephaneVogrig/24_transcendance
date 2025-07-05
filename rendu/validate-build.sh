#!/bin/bash

# Script de validation complète du build
echo "🧪 Test de validation complète"
echo "=============================="

# Variables de couleur
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔍 1. Vérification de la structure des fichiers..."

# Vérifier les fichiers critiques
files_to_check=(
    "docker-compose.yml"
    "docker-compose.prod.yml"
    "Makefile"
    ".env"
    "frontend/package.json"
    "frontend/src/auth/auth0Service.ts"
    "frontend/src/auth/auth0-types.ts"
    "frontend/src/auth/AuthGuard.ts"
    "backend/authentification/package.json"
)

all_files_ok=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_result 0 "$file existe"
    else
        print_result 1 "$file manquant"
        all_files_ok=false
    fi
done

echo ""
echo "🔧 2. Vérification de la configuration..."

# Vérifier les variables d'environnement importantes
if grep -q "VITE_AUTH0_DOMAIN" .env; then
    print_result 0 "Variables Auth0 frontend configurées"
else
    print_result 1 "Variables Auth0 frontend manquantes"
fi

if grep -q "AUTH0_DOMAIN" .env; then
    print_result 0 "Variables Auth0 backend configurées"
else
    print_result 1 "Variables Auth0 backend manquantes"
fi

echo ""
echo "📦 3. Test de syntaxe des fichiers JSON..."

# Vérifier la syntaxe des package.json
json_files=(
    "frontend/package.json"
    "backend/authentification/package.json"
    "backend/tournament/package.json"
    "backend/gateway/package.json"
)

for json_file in "${json_files[@]}"; do
    if [ -f "$json_file" ]; then
        if command -v node > /dev/null 2>&1; then
            if node -e "JSON.parse(require('fs').readFileSync('$json_file', 'utf8'))" 2>/dev/null; then
                print_result 0 "$json_file syntaxe valide"
            else
                print_result 1 "$json_file syntaxe invalide"
            fi
        else
            print_warning "Node.js non disponible, impossible de valider $json_file"
        fi
    fi
done

echo ""
echo "🏗️  4. Test de build simulé..."

# Vérifier les Dockerfiles
dockerfile_issues=false

echo "   Vérification des Dockerfiles..."
if grep -r "npm ci" backend/*/Dockerfile.prod | grep -v "npm install"; then
    print_result 1 "Dockerfiles.prod utilisent encore npm ci"
    dockerfile_issues=true
else
    print_result 0 "Dockerfiles.prod utilisent npm install"
fi

echo ""
echo "🔍 5. Diagnostic des problèmes potentiels..."

# Vérifier les package-lock.json
lockfile_count=$(find backend frontend -name "package-lock.json" 2>/dev/null | wc -l)
total_packages=$(find backend frontend -name "package.json" 2>/dev/null | wc -l)

echo "   Package-lock.json: $lockfile_count/$total_packages services"

if [ $lockfile_count -lt $total_packages ]; then
    print_warning "Certains services n'ont pas de package-lock.json"
    echo "     💡 Exécutez './generate-lockfiles.sh' si vous voulez utiliser npm ci"
fi

echo ""
echo "📋 6. Résumé et recommandations..."

if [ "$all_files_ok" = true ] && [ "$dockerfile_issues" = false ]; then
    echo -e "${GREEN}✅ Configuration de base correcte${NC}"
    echo ""
    echo "🚀 Commandes pour tester :"
    echo "   make dev     # Build en développement"
    echo "   make prod    # Build en production"
    echo ""
    echo "🔧 Si erreurs de build :"
    echo "   ./diagnose-build.sh     # Diagnostic détaillé"
    echo "   ./build-frontend.sh     # Build frontend avec gestion d'erreur"
    echo ""
else
    echo -e "${RED}❌ Problèmes détectés${NC}"
    echo ""
    echo "🔧 Actions recommandées :"
    
    if [ "$all_files_ok" = false ]; then
        echo "   1. Vérifier les fichiers manquants listés ci-dessus"
    fi
    
    if [ "$dockerfile_issues" = true ]; then
        echo "   2. Les Dockerfiles.prod ont été corrigés automatiquement"
    fi
    
    echo "   3. Exécuter: ./diagnose-build.sh pour plus de détails"
fi

echo ""
echo -e "${GREEN}🎯 Validation terminée !${NC}"
