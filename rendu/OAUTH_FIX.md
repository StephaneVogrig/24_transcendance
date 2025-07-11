# Configuration Google OAuth - Guide de Résolution

## Problème résolu
L'erreur "Route GET:/api/auth/google/callback not found" était due à une mauvaise configuration de l'URL de callback.

## Changements effectués

### 1. Correction du fichier .env
**Avant :**
```
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

**Après :**
```
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 2. Correction du gateway (server.ts)
- Déplacement des registrations de proxy dans la fonction `start()` avec `await`
- Ajout de logs pour confirmer la configuration des proxies

### 3. Configuration requise dans Google Console

Vous devez mettre à jour la configuration OAuth dans la Google Console :

1. **Aller sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Sélectionner votre projet**
3. **Aller dans "APIs & Services" > "Credentials"**
4. **Cliquer sur votre OAuth 2.0 Client ID**
5. **Dans "Authorized redirect URIs", remplacer :**
   - ~~`http://localhost:3001/api/auth/google/callback`~~
   - Par : **`http://localhost:3000/api/auth/google/callback`**
6. **Sauvegarder**

## Flow OAuth corrigé

```
1. Frontend (HTTPS) https://localhost:8443
   ↓ Clic sur "Login with Google"
   
2. Appel API → http://localhost:3000/api/auth/google
   ↓ Gateway proxy vers authentification
   
3. Service Auth → http://authentification:3001/google
   ↓ Génère URL Google avec callback
   
4. Redirection Google → accounts.google.com
   ↓ Utilisateur s'authentifie
   
5. Google callback → http://localhost:3000/api/auth/google/callback
   ↓ Gateway proxy vers authentification
   
6. Service Auth → http://authentification:3001/google/callback
   ↓ Traite le code, génère token, définit cookie
   
7. Redirection finale → https://localhost:8443?auth=success
```

## Tests à effectuer

### 1. Test automatique
```bash
cd /home/smortemo/Documents/24_transcendance/rendu
./test_oauth_config.sh
```

### 2. Test manuel
1. Redémarrer les services :
   ```bash
   docker compose restart authentification gateway
   ```

2. Tester l'URL de login :
   ```bash
   curl http://localhost:3000/api/auth/google
   ```

3. Vérifier que l'URL retournée contient le bon callback :
   ```
   redirect_uri=http%3A//localhost%3A3000/api/auth/google/callback
   ```

## Vérification finale

Une fois la Google Console mise à jour :

1. **Ouvrir** https://localhost:8443
2. **Cliquer** sur "Login with Google"
3. **S'authentifier** sur Google
4. **Vérifier** le retour vers l'application avec succès

## Erreurs possibles restantes

### Si la route n'est toujours pas trouvée :
- Vérifier que le gateway est bien redémarré
- Vérifier les logs : `docker compose logs gateway`
- Vérifier que le proxy fonctionne : `curl http://localhost:3000/api/auth/`

### Si Google refuse le callback :
- Vérifier que l'URI dans Google Console est exactement : `http://localhost:3000/api/auth/google/callback`
- Attendre quelques minutes pour la propagation des changements Google

### Si le service d'authentification ne répond pas :
- Vérifier : `docker compose logs authentification`
- Redémarrer : `docker compose restart authentification`
