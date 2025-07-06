#!/bin/bash

echo "🔧 Génération des package-lock.json pour tous les services..."

# Liste des répertoires contenant des package.json
SERVICES=(
    "frontend"
    "backend/gateway"
    "backend/authentification"
    "backend/blockchain"
    "backend/database"
    "backend/game"
    "backend/matchmaking"
    "backend/scores"
    "backend/tournament"
    "backend/websocket"
)

# Fonction pour générer package-lock.json
generate_lock_file() {
    local service_dir=$1
    echo "📦 Génération de package-lock.json pour $service_dir..."
    
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        cd "$service_dir"
        
        # Supprimer node_modules et package-lock.json existants
        rm -rf node_modules package-lock.json
        
        # Installer les dépendances pour générer package-lock.json
        npm install
        
        # Nettoyer node_modules après génération
        rm -rf node_modules
        
        echo "✅ package-lock.json généré pour $service_dir"
        cd - > /dev/null
    else
        echo "❌ Répertoire $service_dir non trouvé ou package.json manquant"
    fi
}

# Générer package-lock.json pour tous les services
for service in "${SERVICES[@]}"; do
    generate_lock_file "$service"
done

echo ""
echo "🎉 Génération terminée ! Vous pouvez maintenant utiliser npm ci dans les Dockerfiles."
echo ""
echo "Pour construire en production :"
echo "  make production"
