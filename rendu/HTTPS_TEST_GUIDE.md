# 🔒 Configuration HTTPS - Guide de Test

## ✅ Certificats SSL Configurés

Les certificats SSL ont été créés et sont valides pour :
- `localhost`
- `127.0.0.1` 
- `::1` (IPv6 localhost)

**Validité :** Jusqu'au 6 octobre 2027

## 🚀 Étapes de Test

### 1. Redémarrer le Service d'Authentification

```bash
cd /home/smortemo/Documents/24_transcendance/rendu
docker-compose restart authentification
```

### 2. Vérifier que le Service Démarre

```bash
docker-compose logs authentification
```

**✅ Attendu :** 
- Message: `Server listening at http://0.0.0.0:3001`
- Message: `Service d'authentification écoute sur le port 3001`
- **Plus de message "URL Google OAuth: Non configuré"** (les variables d'environnement sont maintenant chargées)

### 3. Tester l'API d'Authentification

```bash
curl -k https://localhost:3001/api/auth
```

**✅ Attendu :** Réponse JSON avec les informations d'authentification

### 4. Tester Google OAuth

**4.1. Obtenir l'URL Google OAuth :**
```bash
curl -k https://localhost:3001/api/auth/google
```

**4.2. Dans le navigateur :**
1. Ouvrir: `https://localhost:3001/api/auth/google`
2. Accepter le certificat auto-signé
3. Être redirigé vers Google OAuth

### 5. Tester le Frontend (Optionnel)

```bash
cd frontend && npm run dev
```

Puis ouvrir: `https://localhost:5173`

## 🔧 Configuration Google Cloud Console

**IMPORTANT :** Mettre à jour votre application Google OAuth :

1. **Aller sur :** [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services > Credentials**
3. **Éditer votre OAuth 2.0 Client ID**
4. **Authorized redirect URIs :**
   - Ajouter: `https://localhost:3001/api/auth/google/callback`
5. **Authorized JavaScript origins :**
   - Ajouter: `https://localhost:3001`
   - Ajouter: `https://localhost:8080`

## 🐛 Dépannage

### Erreur de Certificat dans le Navigateur
- Cliquer sur "Advanced" → "Proceed to localhost"
- Ou importer `ssl/localhost.pem` dans les paramètres du navigateur

### Variables d'Environnement Non Chargées
```bash
docker-compose down
docker-compose up --build -d
```

### Vérifier les Logs Détaillés
```bash
docker-compose logs -f authentification
```

## 📝 Variables d'Environnement Actuelles

```env
GOOGLE_CLIENT_ID=36500380422-svg0ld6mpqd19ajqm0nhfpf854as6rrr.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://localhost:3001/api/auth/google/callback
FRONTEND_URL=https://localhost:8080
```
