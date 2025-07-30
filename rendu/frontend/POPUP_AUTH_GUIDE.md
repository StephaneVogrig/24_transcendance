# Guide d'utilisation - Authentification Google avec Popup

## Modifications apportées

### 1. Service Auth0 (`auth0Service.ts`)
- **`loginWithGoogle()`** : Modifiée pour utiliser `loginWithPopup()` au lieu de `loginWithRedirect()`
- **`loginWithGoogleRedirect()`** : Nouvelle fonction de fallback pour la redirection
- **Configuration popup** : Ajout de timeouts et de paramètres de popup
- **Gestion d'erreurs améliorée** : Messages plus clairs et spécifiques aux popups

### 2. Helpers pour popups (`popupHelpers.ts`)
- **`isPopupSupported()`** : Détecte si les popups sont supportées
- **`isPopupBlocked()`** : Vérifie si les popups sont bloquées
- **`getPopupErrorMessage()`** : Retourne des messages d'erreur adaptés
- **`showPopupBlockedMessage()`** : Affiche un guide pour débloquer les popups

### 3. Page de connexion (`LoginPage.ts`)
- **Gestion d'erreurs améliorée** : Messages spécifiques aux erreurs de popup
- **Fallback automatique** : Utilise la redirection si les popups sont bloquées
- **Messages utilisateur** : Interface plus claire avec les différents états

### 4. Types TypeScript (`types/auth0.d.ts`)
- **Déclarations de types** : Types complets pour Auth0 SPA SDK
- **Support popup** : Types spécifiques pour les options de popup

## Comment utiliser

### Connexion normale
L'utilisateur clique sur "Continue with Google" → Une popup s'ouvre → Authentification → Popup se ferme → Utilisateur connecté

### Fallback automatique
Si les popups sont bloquées → Le système utilise automatiquement la redirection classique

### Tests disponibles
En mode développement, utilisez la console :
```javascript
// Tester le support des popups
window.authTest.testPopupAuth()

// Tester la connexion
window.authTest.testLogin()

// Tester la déconnexion  
window.authTest.testLogout()

// Vérifier l'état d'authentification
await window.authTest.isAuthenticated()

// Récupérer l'utilisateur actuel
await window.authTest.getUser()
```

## Avantages des popups

1. **Expérience utilisateur améliorée** : Pas de redirection de page
2. **Conservation du contexte** : L'utilisateur reste sur la même page
3. **Plus rapide** : Pas de rechargement complet de l'application
4. **Fallback automatique** : Si les popups ne fonctionnent pas, utilise la redirection

## Gestion d'erreurs

- **Popup fermée par l'utilisateur** : Message informatif, pas d'erreur critique
- **Popup bloquée** : Tentative automatique avec redirection
- **Timeout** : Message d'erreur et possibilité de réessayer
- **Erreurs réseau** : Messages appropriés avec suggestions

## Configuration Auth0

Assurez-vous que votre configuration Auth0 autorise :
- Les callbacks vers votre domaine
- L'utilisation des popups
- La connexion Google OAuth2

## Notes importantes

- Les popups peuvent être bloquées par les navigateurs
- Le fallback vers la redirection est automatique
- Les tests sont disponibles uniquement en développement
- La synchronisation avec le backend reste optionnelle
