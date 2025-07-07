#!/bin/bash

# Script de configuration SSL pour le projet Transcendance

echo "🔒 Configuration SSL pour Transcendance"

# Vérifier que les certificats existent
if [ ! -f "localhost.pem" ] || [ ! -f "localhost-key.pem" ]; then
    echo "❌ Certificats SSL non trouvés!"
    echo "Exécutez d'abord: mkcert -key-file ssl/localhost-key.pem -cert-file ssl/localhost.pem localhost 127.0.0.1 ::1"
    exit 1
fi

echo "✅ Certificats SSL trouvés"
echo "📄 Certificat: $(pwd)/localhost.pem"
echo "🔑 Clé privée: $(pwd)/localhost-key.pem"

# Afficher les informations du certificat
echo ""
echo "🔍 Informations du certificat:"
openssl x509 -in localhost.pem -text -noout | grep -A 5 "Subject:"
openssl x509 -in localhost.pem -text -noout | grep -A 2 "Validity"
openssl x509 -in localhost.pem -text -noout | grep -A 5 "Subject Alternative Name"

echo ""
echo "🚀 Configuration terminée!"
echo "💡 Pour faire confiance au certificat dans votre navigateur:"
echo "   1. Ouvrez https://localhost:8080"
echo "   2. Cliquez sur 'Advanced' puis 'Proceed to localhost'"
echo "   3. Ou importez le certificat dans les paramètres de votre navigateur"
