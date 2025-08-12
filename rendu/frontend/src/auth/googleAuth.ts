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
    
    return `${GOOGLE_OAUTH_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * Connexion avec Google via popup
 */
export async function loginWithGoogle(): Promise<void> {
    try {
        const authUrl = buildAuthUrl();
        
        // Configuration de la popup
        const popupWidth = 500;
        const popupHeight = 600;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;
        
        const popup = window.open(
            authUrl,
            'google-oauth',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
        
        if (!popup) {
            throw new Error('Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.');
        }
        
        // Écouter la fermeture de la popup ou le retour de l'OAuth
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                console.log('Checking if popup is closed...');
                if (popup.closed) {
                    console.log('Popup was closed');
                    clearInterval(checkClosed);
                    // Vérifier si on a reçu une réponse
                    const token = localStorage.getItem('oauth_temp_token');
                    if (token) {
                        console.log('Found temp token, using it...');
                        localStorage.removeItem('oauth_temp_token');
                        localStorage.setItem('access_token', token);
                        // Notifier le changement d'état d'authentification
                        notifyAuthStateChange();
                        resolve();
                    } else {
                        console.log('No temp token found, connection cancelled');
                        reject(new Error('Connexion annulée par l\'utilisateur'));
                    }
                }
            }, 1000);
            
            // Écouter les messages de la popup
            const messageListener = (event: MessageEvent) => {
                console.log('🔔 Message received from popup:', event.data);
                console.log('🌐 Event origin:', event.origin);
                console.log('🌐 Window origin:', window.location.origin);
                
                if (event.origin !== window.location.origin) {
                    console.log('❌ Message ignored - wrong origin:', event.origin);
                    return;
                }
                
                if (event.data.type === 'OAUTH_SUCCESS') {
                    console.log('✅ OAuth success received, cleaning up...');
                    console.log('🔑 Token to save:', event.data.token ? event.data.token.substring(0, 20) + '...' : 'MISSING');
                    
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageListener);
                    
                    // Vérifier que nous avons un token
                    if (!event.data.token) {
                        console.error('❌ No token in success message');
                        reject(new Error('Token manquant dans la réponse'));
                        return;
                    }
                    
                    // Fermer la popup côté parent
                    if (!popup.closed) {
                        console.log('🔒 Closing popup from parent...');
                        try {
                            popup.close();
                            // Vérifier si la fermeture a fonctionné
                            setTimeout(() => {
                                if (!popup.closed) {
                                    console.log('⚠️ Popup still open, trying to force close...');
                                    // Essayer de rediriger la popup vers about:blank
                                    try {
                                        popup.location.href = 'about:blank';
                                        popup.close();
                                    } catch (e) {
                                        console.warn('Could not force close popup:', e);
                                    }
                                }
                            }, 200);
                        } catch (e) {
                            console.error('Error closing popup:', e);
                        }
                    }
                    
                    try {
                        localStorage.setItem('access_token', event.data.token);
                        console.log('💾 Token saved to localStorage successfully');
                        
                        // Vérifier que le token a bien été sauvegardé
                        const savedToken = localStorage.getItem('access_token');
                        if (savedToken === event.data.token) {
                            console.log('✅ Token verification successful');
                            // Notifier le changement d'état d'authentification
                            notifyAuthStateChange();
                        } else {
                            console.error('❌ Token verification failed');
                            throw new Error('Erreur lors de la sauvegarde du token');
                        }
                    } catch (e) {
                        console.error('❌ Error saving token to localStorage:', e);
                        reject(new Error('Erreur lors de la sauvegarde du token'));
                        return;
                    }
                    
                    console.log('🎉 Resolving promise...');
                    resolve();
                } else if (event.data.type === 'OAUTH_ERROR') {
                    console.log('OAuth error received:', event.data.error);
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageListener);
                    
                    if (!popup.closed) {
                        popup.close();
                    }
                    reject(new Error(event.data.error));
                }
            };
            
            window.addEventListener('message', messageListener);
            
            // Timeout après 5 minutes
            setTimeout(() => {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageListener);
                if (!popup.closed) {
                    popup.close();
                }
                reject(new Error('Timeout de connexion'));
            }, 300000); // 5 minutes
        });
    } catch (error) {
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
        
        if (error) {
            // Envoyer l'erreur à la fenêtre parent
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: `Erreur OAuth: ${error}`
                }, window.location.origin);
                window.close();
            }
            throw new Error(`Erreur OAuth: ${error}`);
        }
        
        if (!code) {
            const errorMsg = 'Code d\'autorisation manquant';
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: errorMsg
                }, window.location.origin);
                window.close();
            }
            throw new Error(errorMsg);
        }
        
        // Vérification du state pour la sécurité CSRF
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
        
        // Nettoyer le state du stockage
        sessionStorage.removeItem('oauth_state');
        
        // Échanger le code contre un token via notre backend
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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.message || 'Erreur lors de l\'échange du code';
            
            if (window.opener) {
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
        if (window.opener) {
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
//         };
        
//     } catch (error) {
//         console.error('Erreur lors du traitement du callback OAuth:', error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : 'Erreur inconnue'
//         };
//     }
// }

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
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expiré ou invalide
                localStorage.removeItem('access_token');
                return null;
            }
            throw new Error('Erreur lors de la récupération des informations utilisateur');
        }
        
        // console.log('+++ FRONT getCurrentUser response:', response);
        const user =  await response.json();
        console.log('+++ FRONT  user:', user);

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
export function onAuthStateChange(callback: () => void): void {
    authStateChangeCallbacks.push(callback);
}

/**
 * Supprime un callback d'état d'authentification
 */
export function removeAuthStateChangeCallback(callback: () => void): void {
    const index = authStateChangeCallbacks.indexOf(callback);
    if (index > -1) {
        authStateChangeCallbacks.splice(index, 1);
    }
}

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
        <img class="w-5 h-5 mr-2" src="/assets/Google_logo.png" alt="Google Logo" />
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
    
    if (isAuthenticated()) {
        // Utilisateur connecté : afficher le bouton Profile
        const profileButton = createProfileButton();
        container.appendChild(profileButton);
    } else {
        // Utilisateur non connecté : afficher le bouton Google
        const tempDiv = document.createElement('div');
        createGoogleButton(container, tempDiv);
    }
}
//     }


/**
 * Crée un conteneur de bouton d'authentification qui se met à jour automatiquement
 */
export function createAuthButtonContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'auth-button-container';
  
    updateButton(container);
    
    // S'abonner aux changements d'état
    const authStateChange = () => updateButton(container); //  fonction de rappel
    onAuthStateChange(authStateChange); // passe la fonction de rappel

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
