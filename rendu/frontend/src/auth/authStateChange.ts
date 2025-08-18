import { createGoogleButton, createProfileButton} from './authButton';
// Système de callbacks pour notifier les changements d'état d'authentification
const authStateChangeCallbacks: (() => void)[] = [];
// import { authStateChangeCallbacks } from './authStateChange.ts';

export function notifyAuthStateChange(): void {
    for (let i = 0; i < authStateChangeCallbacks.length; i++) 
    {
        try 
        {
            authStateChangeCallbacks[i]();
        } 
        catch (error) {
            console.error('Erreur dans le callback d\'état d\'authentification:', error);
        }
    }
}

export function onAuthStateChange(callback: () => void): void {
    authStateChangeCallbacks.push(callback);
}


/**
 * Crée un conteneur de bouton d'authentification qui se met à jour automatiquement
 */
export function createAuthButtonContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'auth-button-container';
  
    // Initialiser le conteneur avec l'état actuel
    // si connecté -> Profile  | sinon -> Google
    updateButton(container); 
    
    // S'abonner aux changements d'état
    // mise à jour du bouton selon état authentification
    const authStateChange = () => updateButton(container);
    authStateChangeCallbacks.push(authStateChange);

    // onAuthStateChange(() => updateButton(container)); 

    return container;
}


function updateButton(container: HTMLElement): void {
    
    container.innerHTML = ''; // Effacer le contenu
    
    // if (isAuthenticated()) 
    if (localStorage.getItem('access_token') !== null) // Utilisateur connecté -> bouton Profile
    {
        const profileButton = createProfileButton();
        container.appendChild(profileButton);
    } 
    else // Utilisateur non connecté -> bouton Google
    {
        const tempDiv = document.createElement('div');
        createGoogleButton(container, tempDiv);
    }
}
