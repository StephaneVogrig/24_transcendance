#!/bin/bash

# Script de démarrage HTTPS pour le service d'authentification

echo "🔒 Démarrage du service d'authentification avec HTTPS"

# Vérifier que les certificats existent
if [ ! -f "/app/ssl/localhost.pem" ] || [ ! -f "/app/ssl/localhost-key.pem" ]; then
    echo "⚠️  Certificats SSL non trouvés, démarrage en HTTP..."
    exec npm run dev
else
    echo "✅ Certificats SSL trouvés"
    echo "🚀 Démarrage en HTTPS sur le port 3001"
    exec npm run dev
fi
