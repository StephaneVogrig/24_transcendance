import { GOOGLE_OAUTH_CONFIG, API_BASE_URL } from '../config';
import { locale } from '../i18n';
import { navigate } from '../router';

// Interface pour les informations utilisateur Google
export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
    family_name?: string;
}

// Interface pour la réponse d'authentification
export interface AuthResponse {
    success: boolean;
    user?: GoogleUser;
    token?: string;
    error?: string;
}

/**
 * Génère une chaîne aléatoire pour le state parameter (sécurité CSRF)
 */
function generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Génère l'URL d'autorisation Google OAuth 2.0
 */
function buildAuthUrl(): string {
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
        scope: GOOGLE_OAUTH_CONFIG.SCOPE,
        response_type: GOOGLE_OAUTH_CONFIG.RESPONSE_TYPE,
        state: state,
        access_type: 'offline',
        prompt: 'consent'
    });
    
    console.log('OAuth URL params:', params.toString());
    console.log('OAuth AUTH_URL:', GOOGLE_OAUTH_CONFIG.AUTH_URL);

    return `${GOOGLE_OAUTH_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * Ferme la popup avec plusieurs méthodes de fallback
 */
function closePopup(popup: Window): void {
    try 
    {
        console.log('Closing popup');

        popup.close();
        setTimeout(() => {
            if (!popup.closed) 
            {
                console.log('Popup still open, trying to force close...');
                try 
                {
                    popup.location.href = 'about:blank';
                    popup.close();
                } 
                catch (e) {
                    console.warn('Could not force close popup:', e);
                }
            }
        }, 200);
    } 
    catch (e) {
        console.error('Error closing popup:', e);
    }
}

/**
 * Gestionnaire des messages OAuth reçus de la popup -> appel dans la fonction loginWithGoogle() -> createOAuthMessageListener 
 */
function createOAuthMessageListener( popup: Window, onSuccess: () => void, onError: (error: Error) => void, cleanup: () => void): (event: MessageEvent) => void {
   
    return (event: MessageEvent) => {
        console.log('Message received from popup:', event.data);
        console.log('Event origin:', event.origin);
        console.log('Window origin:', window.location.origin);
        
        // Vérif origine -> sécurité
        if (event.origin !== window.location.origin) 
        {
            console.log('Message ignored - wrong origin:', event.origin);
            return;
        }
        
        if (event.data.type === 'OAUTH_SUCCESS') 
        {
            console.log('OAuth success received, cleaning up...');
            console.log('Token to save:', event.data.token ? event.data.token.substring(0, 20) + '...' : 'MISSING');
            cleanup(); // Nettoyer les listeners et intervalles
            
            if (!event.data.token) 
            {
                console.error('No token in success message');
                onError(new Error('Token manquant dans la réponse'));
                return;
            }
            
            if (!popup.closed) // Fermer la popup si elle tjrs ouverte
                closePopup(popup); 
            
            try 
            {
                localStorage.setItem('access_token', event.data.token); // Sauvegarde token
                console.log('Token saved to localStorage successfully');
                
                const savedToken = localStorage.getItem('access_token');// Vérif token a été sauvegardé
                if (savedToken === event.data.token) 
                {
                    console.log('Token verification successful');
                    notifyAuthStateChange(); // Notifier le changement d'état d'authentification
                    onSuccess();
                } 
                else
                {
                    console.error('Token verification failed');
                    throw new Error('Erreur lors de la sauvegarde du token');
                }
            } 
            catch (e) {
                console.error('Error saving token to localStorage:', e);
                onError(new Error('Erreur lors de la sauvegarde du token'));
            }
            
        } 
        else if (event.data.type === 'OAUTH_ERROR') 
        {
            console.log('OAuth error received:', event.data.error);
            cleanup();
            
            if (!popup.closed)
                popup.close();

            onError(new Error(event.data.error));
        }
    };
}


/**
 * Nettoie les ressources OAuth popup
 */
function cleanupPopupResources(resources: PopupResources): void {
    console.log('Cleaning up OAuth popup resources...');
    
    if (resources.intervalId) {
        clearInterval(resources.intervalId);
        resources.intervalId = null;
        console.log('Interval cleared');
    }
    
    if (resources.messageListener) {
        window.removeEventListener('message', resources.messageListener);
        resources.messageListener = null;
        console.log('Message listener removed');
    }
}

/**
 * Gère l'attente de la réponse OAuth depuis la popup
 */
function handlePopupResponse(popup: Window): Promise<void> {
        
    return new Promise((resolve, reject) => {
        const resources: PopupResources = {
            intervalId: null,
            messageListener: null
        };

         // Fonction de nettoyage qui utilise la fonction externalisée
        const cleanup = () => cleanupPopupResources(resources);
        
        // Créer le gestionnaire de messages APRÈS avoir défini cleanup
        resources.messageListener = createOAuthMessageListener( popup,
            () => {
                console.log('OAuth success - resolving promise');
                resolve();
            },
            (error) => {
                console.error('OAuth error - rejecting promise:', error);
                reject(error);
            },
            cleanup
        );

        window.addEventListener('message', resources.messageListener); // Écoute messages popup

        // Check fermeture manuelle de la popup
        resources.intervalId = window.setInterval(() => {
            console.log('Checking if popup is closed...');
            if (popup.closed) 
            {
                console.log('Popup was closed manually');
                cleanup();
                
                // Vérifier token reçu de la popup
                const tempToken = localStorage.getItem('oauth_temp_token');
                if (tempToken) 
                {
                    console.log('Found temp token, using it...');
                    localStorage.removeItem('oauth_temp_token');
                    localStorage.setItem('access_token', tempToken);
                    notifyAuthStateChange();
                    resolve();
                } 
                else 
                {
                    console.log('No temp token found, connection cancelled');
                    reject(new Error('Connexion annulée par l\'utilisateur'));
                }
            }
        }, 1000);


        setTimeout(() => {
            console.log('OAuth timeout reached');
            cleanup();
            if (!popup.closed)
                closePopup(popup);
            reject(new Error('Timeout de connexion (5 minutes)'));
        }, 300000);
    });
}

export async function loginWithGoogle(): Promise<void> {
    try
    {
        const authUrl = buildAuthUrl();
        
        // Config popup
        const popupWidth = 500;
        const popupHeight = 600;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;
        
        const popup = window.open(
            authUrl,
            'google-oauth',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
        
        if (!popup) 
        {
            throw new Error('Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.');
        }
        
        //gestion popup
        await handlePopupResponse(popup);
        console.log('Popup closed successfully, user logged in'); // si connection réussie
    } 
    catch (error) {
        console.error('Erreur lors de l\'ouverture de la popup Google:', error);
        throw new Error('Échec de l\'ouverture de la popup Google');
    }
}

/**
 * Traite le callback OAuth dans la popup
 */
export async function handleOAuthCallback(): Promise<AuthResponse> {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) 
        {
            if (window.opener) // Envoie erreur à la fenêtre parent
            {
                console.error('Send error to window.location.origin ->', window.location.origin);
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: `Erreur OAuth: ${error}`
                }, window.location.origin);
                window.close();
            }
            throw new Error(`Erreur OAuth: ${error}`);
        }
        
        if (!code) 
        {
            const errorMsg = 'Code d\'autorisation manquant';
            if (window.opener) 
            {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: errorMsg
                }, window.location.origin);
                window.close();
            }
            throw new Error(errorMsg);
        }
        
        // Vérification du state -> sécurité CSRF
        const savedState = sessionStorage.getItem('oauth_state');
        if (!savedState || savedState !== state) {
            const errorMsg = 'État OAuth invalide - possible attaque CSRF';
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: errorMsg
                }, window.location.origin);
                window.close();
            }
            throw new Error(errorMsg);
        }
        
        sessionStorage.removeItem('oauth_state'); // Nettoyer state du stockage
        
        // Échanger code contre token dans backend
        const response = await fetch(`${API_BASE_URL}/authentification/oauth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI
            })
        });
        
        if (!response.ok) 
        {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || 'Erreur lors de l\'échange du code';
            
            if (window.opener) 
            {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: errorMsg
                }, window.location.origin);
                window.close();
            }
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        // Envoyer le succès à la fenêtre parent
        if (window.opener) 
        {
            window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                token: data.access_token,
                user: data.user
            }, window.location.origin);
            window.close();
        }
        
        return {
            success: true,
            user: data.user,
            token: data.access_token
        };
        
    } catch (error) {
        console.error('Erreur lors du traitement du callback OAuth:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
}


/**
 * Récupère les informations de l'utilisateur connecté
 */
export async function getCurrentUser(): Promise<GoogleUser | null> {
   
   console.log('+++ FRONT getCurrentUser called');
    try {
        const token = localStorage.getItem('access_token');
        if (!token) 
            return null;
        
        const response = await fetch(`${API_BASE_URL}/authentification/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) 
        {
            if (response.status === 401) // Token invalide
            {
                localStorage.removeItem('access_token');
                return null;
            }
            throw new Error('Erreur lors de la récupération des informations utilisateur');
        }
        
        // console.log('+++ FRONT getCurrentUser response:', response);
        const user =  await response.json();
        // console.log('+++ FRONT  user:', user);

        return user;  
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('access_token'));
    // voir si change par appel db
}

// Système de callbacks pour notifier les changements d'état d'authentification
const authStateChangeCallbacks: (() => void)[] = [];

/**
 * Ajoute un callback qui sera appelé quand l'état d'authentification change
 */
/**
 * Enregistre une fonction de rappel qui sera appelée à chaque changement d'état d'authentification.
 * param callback - Fonction à exécuter lorsque l'état d'authentification change.
 * Cette fonction ajoute le callback fourni à la liste des écouteurs (`authStateChangeCallbacks`)
 * qui seront appelés lors d'une mise à jour du statut d'authentification (connexion, déconnexion, etc.).
 * Utilisez cette fonction pour réagir aux changements d'état d'authentification dans votre application.
 */

// PLUS UTILISEE -> push directement dans createAuthButtonContainer
export function onAuthStateChange(callback: () => void): void {
    authStateChangeCallbacks.push(callback);
}

/**
 * Supprime un callback d'état d'authentification
 */
// export function removeAuthStateChangeCallback(callback: () => void): void {
//     const index = authStateChangeCallbacks.indexOf(callback);
//     if (index > -1) {
//         authStateChangeCallbacks.splice(index, 1);
//     }
// }

/**
 * Notifie tous les callbacks que l'état d'authentification a changé
 */
function notifyAuthStateChange(): void {
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

/**
 * Déconnecte l'utilisateur
 */
export async function logout(): Promise<void> {
    console.log('!!!!!Déconnexion de l\'utilisateur...');
    try {
        const token = localStorage.getItem('access_token');
        
        if (token) // envoie info backend déconnexion
        {
            await fetch(`${API_BASE_URL}/authentification/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(console.error); // Ne pas bloquer si la requête échoue
        }
        
        // Nettoie storage
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('oauth_state');
        
        // Notifier les changements d'état
        notifyAuthStateChange();
        navigate('/');  // Redir accueil
    } 
    catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        localStorage.removeItem('access_token');// Nettoie stockage local
        navigate('/');
    }
}

/**
 * Crée le bouton de connexion Google
 */
export const createGoogleButton = (loginForm: HTMLElement, authMessageDiv: HTMLElement): void => {
    const googleButton = document.createElement('button');
    googleButton.id = 'google-oauth-btn';
    googleButton.className = 'w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200';
    googleButton.innerHTML = `
        <img class="w-5 h-5 mr-2" src="/assets/Google_logo.jpg" alt="Google Logo" />
        ${locale.google}
    `;
    loginForm.appendChild(googleButton);

    // Redirection vers OAuth Google au clic
    googleButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try 
        {
            authMessageDiv.textContent = 'Redirection vers Google...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            await loginWithGoogle();
        } 
        catch (error) {
            console.error('Erreur lors de la connexion Google:', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    });
};

/**
 * Crée un bouton Profile qui redirige vers la page de profil
 */
export function createProfileButton(): HTMLElement {
    const profileButton = document.createElement('button');
    profileButton.className = 'btn btn-secondary max-w-40 mx-auto text-center bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
    profileButton.textContent = locale.profile || 'Profile';
    profileButton.addEventListener('click', () => {
        navigate('/profile');
    });
    return profileButton;
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
    const authStateChange = () => updateButton(container);

    authStateChangeCallbacks.push(authStateChange);
    onAuthStateChange(() => updateButton(container)); // mise à jour du bouton selon état authentification

// ou
    // authStateChangeCallbacks.push(() => updateButton(container)); // passe la fonction de rappel
    // onAuthStateChange(authStateChange); // passe la fonction de rappel
// ou
    // authStateChangeCallbacks.push(() => updateButton(container));
    // onAuthStateChange(() => updateButton(container));
    
    return container;
}

/**
 * Rafraîchit le token d'accès
 */
export async function refreshToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/authentification/refresh`, {
            method: 'POST',
            credentials: 'include' // Pour envoyer les cookies avec le refresh token
        });
        
        if (!response.ok) 
            return false;
        
        const data = await response.json();
        if (data.access_token) 
        {
            localStorage.setItem('access_token', data.access_token);
            return true;
        }
        return false;
        
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        return false;
    }
}
