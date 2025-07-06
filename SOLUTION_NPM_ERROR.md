# 🚨 Résolution du Problème "npm ERR! Missing script: dev"

## Problème Identifié

Vous obtenez l'erreur `npm ERR! Missing script: "dev"` parce que :
1. **Node.js/npm ne sont pas installés** dans votre environnement VS Code actuel
2. L'application est **conçue pour fonctionner avec Docker**
3. Le script "dev" existe mais nécessite tsx (TypeScript executor)

## 🎯 Solutions par Ordre de Préférence

### Solution 1: Dev Containers (Recommandé pour VS Code)

1. **Installer l'extension "Dev Containers"** dans VS Code
2. **Créer un devcontainer.json** :

```bash
# Créer le dossier .devcontainer
mkdir -p .devcontainer
```

Puis créer le fichier `.devcontainer/devcontainer.json` :

```json
{
  "name": "Transcendance Dev",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "authentification",
  "workspaceFolder": "/app",
  "forwardPorts": [3001, 8080, 3000],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

3. **Ouvrir dans le container** : `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

### Solution 2: Terminal Externe avec Docker

Ouvrez un terminal système (pas celui de VS Code) :

```bash
cd /path/to/votre/projet/transcendance/rendu

# Démarrer les services
docker-compose up -d

# Vérifier que ça fonctionne
curl http://localhost:3001/api/auth
curl http://localhost:3001/api/auth/google
```

### Solution 3: Installation Node.js Locale

Si vous voulez développer sans Docker :

```bash
# Sur votre système (pas dans VS Code)
# Installer Node.js 18+ depuis https://nodejs.org

cd backend/authentification
npm install
npm run dev

# Dans un autre terminal
cd frontend
npm install  
npm run dev
```

### Solution 4: GitHub Codespaces

1. **Push votre code sur GitHub**
2. **Créer un Codespace** depuis GitHub
3. Les dépendances Node.js seront automatiquement disponibles

## 🔧 Configuration Actuelle

Vos fichiers sont correctement configurés :
- ✅ `package.json` contient le script "dev"
- ✅ Variables Google OAuth dans `.env`
- ✅ Code frontend modifié pour pointer vers localhost:3001
- ✅ Docker Compose configuré

Le seul problème est l'environnement d'exécution.

## 🧪 Test Rapide

Pour vérifier que votre configuration Google OAuth est correcte, vous pouvez tester manuellement :

1. **Ouvrez un navigateur** sur votre machine locale
2. **Démarrez l'application** avec Docker (terminal externe)
3. **Allez sur** `http://localhost:8080/login`
4. **Ouvrez les outils de développement** (F12)
5. **Cliquez sur "Continue with Google"**
6. **Regardez les erreurs** dans la console

## 🎯 Action Immédiate Recommandée

**Option A - Dev Containers (Plus simple)**:
1. Installer l'extension "Dev Containers" 
2. Utiliser la commande "Reopen in Container"
3. Le tout sera automatiquement configuré

**Option B - Terminal Externe**:
1. Ouvrir un terminal système 
2. `cd /path/to/votre/projet/rendu`
3. `docker-compose up -d`
4. Tester sur `http://localhost:8080`

## 📋 Checklist Finale

- [ ] Environnement de développement configuré (Docker ou Node.js)
- [ ] Services démarrés (authentification sur port 3001)
- [ ] Frontend accessible (port 8080)
- [ ] Variables Google OAuth configurées dans .env
- [ ] Test de connexion Google OAuth

Une fois l'environnement correctement configuré, votre Google OAuth devrait fonctionner parfaitement !

## 🆘 Si Rien ne Fonctionne

Partagez ces informations :
1. Votre système d'exploitation
2. Si vous avez Docker installé
3. Les erreurs exactes dans la console du navigateur
4. Les logs des services Docker
