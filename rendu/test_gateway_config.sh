#!/bin/bash

echo "=== Test simple du Gateway ==="
echo ""

# Vérifier la syntaxe TypeScript
echo "1. Vérification de la syntaxe TypeScript du gateway:"
cd /home/smortemo/Documents/24_transcendance/rendu/backend/gateway
npx tsc --noEmit src/server.ts 2>&1 || echo "Erreurs de syntaxe détectées"
echo ""

# Vérifier les dépendances
echo "2. Vérification des dépendances:"
npm list --depth=0 2>/dev/null || echo "Problème avec les dépendances"
echo ""

# Afficher la configuration réseau du docker-compose
echo "3. Configuration réseau Docker Compose:"
cd /home/smortemo/Documents/24_transcendance/rendu
grep -A 10 -B 2 "gateway:" docker-compose.yml
echo ""

# Afficher les ports configurés
echo "4. Ports configurés dans docker-compose.yml:"
grep -E "ports:|\"[0-9]+:[0-9]+\"" docker-compose.yml
echo ""

echo "=== Fin du test ==="
