#!/bin/bash

echo "🔍 Validation des fichiers tsconfig.json..."

# Liste des services TypeScript
SERVICES=(
    "frontend"
    "backend/gateway"
    "backend/authentification"
    "backend/matchmaking"
    "backend/scores"
    "backend/websocket"
)

# Fonction pour valider un fichier JSON
validate_json() {
    local file=$1
    if [ -f "$file" ]; then
        if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
            echo "✅ $file est valide"
            return 0
        else
            echo "❌ $file contient des erreurs de syntaxe JSON"
            return 1
        fi
    else
        echo "❌ $file non trouvé"
        return 1
    fi
}

# Validation de tous les tsconfig.json
all_valid=true
for service in "${SERVICES[@]}"; do
    tsconfig_file="$service/tsconfig.json"
    if ! validate_json "$tsconfig_file"; then
        all_valid=false
    fi
done

echo ""
if [ "$all_valid" = true ]; then
    echo "🎉 Tous les fichiers tsconfig.json sont valides !"
    exit 0
else
    echo "💥 Certains fichiers tsconfig.json contiennent des erreurs"
    exit 1
fi
