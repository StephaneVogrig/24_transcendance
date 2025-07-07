#!/bin/bash

# Script de configuration et démarrage HTTPS pour Transcendance

echo "🔒 Configuration HTTPS pour Transcendance"
echo "========================================"

# Aller dans le répertoire du projet
cd "$(dirname "$0")"

# Vérifier que mkcert est installé
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert n'est pas installé."
    echo "💡 Installation automatique..."
    
    # Télécharger et installer mkcert
    cd /tmp
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
    chmod +x mkcert-v*-linux-amd64
    mkdir -p ~/.local/bin
    mv mkcert-v*-linux-amd64 ~/.local/bin/mkcert
    export PATH="$HOME/.local/bin:$PATH"
    echo "✅ mkcert installé"
    
    # Retourner au répertoire du projet
    cd - > /dev/null
fi

# Installer l'autorité de certification
echo "🔧 Installation de l'autorité de certification..."
mkcert -install 2>/dev/null || echo "⚠️  Installation manuelle de l'autorité de certification requise"

# Créer les certificats SSL si ils n'existent pas
if [ ! -f "ssl/localhost.pem" ] || [ ! -f "ssl/localhost-key.pem" ]; then
    echo "🔐 Création des certificats SSL..."
    mkdir -p ssl
    mkcert -key-file ssl/localhost-key.pem -cert-file ssl/localhost.pem localhost 127.0.0.1 ::1
    echo "✅ Certificats SSL créés"
else
    echo "✅ Certificats SSL déjà présents"
fi

# Vérifier les certificats
./ssl/setup-ssl.sh

# Rebuild et redémarrer les services
echo ""
echo "🔄 Rebuild et redémarrage des services..."

# Arrêter les services existants
docker-compose down 2>/dev/null

# Rebuild et démarrer avec HTTPS
echo "🚀 Démarrage des services avec HTTPS..."
docker-compose up --build -d

echo ""
echo "✅ Configuration HTTPS terminée!"
echo ""
echo "🌐 URLs HTTPS disponibles:"
echo "   Frontend: https://localhost:8080"
echo "   API Auth: https://localhost:3001/api/auth"
echo "   Gateway:  https://localhost:3000"
echo ""
echo "💡 Pour faire confiance aux certificats:"
echo "   1. Ouvrez les URLs dans votre navigateur"
echo "   2. Cliquez sur 'Advanced' puis 'Proceed to localhost'"
echo "   3. Ou importez le certificat ssl/localhost.pem dans votre navigateur"
echo ""
echo "🔍 Vérification des services:"
echo "   docker-compose logs -f"
