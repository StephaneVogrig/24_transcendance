import { GOOGLE_OAUTH_CONFIG, API_BASE_URL } from '../config';
import { navigate } from '../router';
import { handlePopupResponse } from './authManagePopUp';
import { notifyAuthStateChange } from './authStateChange';

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

// Génère une chaîne aléatoire qui sera le state parameter (sécurité CSRF)
function generateStateCode(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}


// Génère l'URL d'autorisation Google OAuth 2.0
function buildAuthUrl(): string {
    const stateCode = generateStateCode(); // chaine aléatoire créé pour state -> secure
    
    // Utiliser localStorage au lieu de sessionStorage pour partager entre fenêtres
    localStorage.setItem('oauth_state', stateCode);
    //sessionStorage.setItem('oauth_state', stateCode);

    const params = new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
        scope: GOOGLE_OAUTH_CONFIG.SCOPE,
        response_type: GOOGLE_OAUTH_CONFIG.RESPONSE_TYPE,
        state: stateCode, // pour securité verif dans la fenêtre de la popup
        access_type: 'offline',
        prompt: 'consent'
    });
    
    console.log('OAuth URL params:', params.toString());
    console.log('OAuth AUTH_URL:', GOOGLE_OAUTH_CONFIG.AUTH_URL);
    console.log('State saved to localStorage:', stateCode);


    return `${GOOGLE_OAUTH_CONFIG.AUTH_URL}?${params.toString()}`;
}

export async function loginWithGoogle(): Promise<void> {
    try
    {
        const authUrl = buildAuthUrl(); // on cree URL d'autorisation pour Google OAuth
        
        console.log('Google OAuth  URL:', authUrl);

        // config + ouverture popup
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
        
        await handlePopupResponse(popup); //gestion popup
        console.log('Popup closed successfully, user logged in'); // si connection réussie
    } 
    catch (error) {
        console.error('Erreur lors de l\'ouverture de la popup Google:', error);
        throw new Error('Échec de l\'ouverture de la popup Google');
    }
}


// Gestion callback OAuth dans popup
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
        
        // Vérification du state -> sécurité CSRF -Cross site request forgery-
        const savedState = localStorage.getItem('oauth_state');  // Utilise localStorage pour partager entre fenêtres
       
        if (!savedState || savedState !== state) {
            const errorMsg = 'État OAuth invalide';
            if (window.opener) {
                window.opener.postMessage({
                    type: 'OAUTH_ERROR',
                    error: errorMsg
                }, window.location.origin);
                window.close();
            }
            throw new Error(errorMsg);
        }
        
        localStorage.removeItem('oauth_state'); // Nettoyer state du stockage depuis localStorage
        
        // Échanger code contre token dans backend
        const response = await fetch(`${API_BASE_URL}/authentification/oauth/googleCodeToTockenUser`, {
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
        
        if (window.opener) // Envoyer le succès à la fenêtre parent
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

// recup info utilisateur connecte avec le JWT token que l'on a créé dans le backend depuis la popup
export async function getCurrentUser(): Promise<GoogleUser | null> {

    try {
        const token = localStorage.getItem('access_token');
        if (!token) 
            return null;
        
        // on va demander au backend d'extraire les info user duJWT token
        const response = await fetch(`${API_BASE_URL}/authentification/userInfoJWT`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) 
        {
            if (response.status === 401) // Token invalide ou utilisateur n'est pas dans db
            {
                localStorage.removeItem('access_token');
                return null;
            }
            throw new Error('User not registered or error retrieving user information');
        }
        
        const user =  await response.json();

        return user;  
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
}

// Vérif si user connecté
export function isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('access_token'));
}

//Déco utilisateur
export async function logout(): Promise<void> {
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
        
        // Notif changements d'état
        notifyAuthStateChange();
        navigate('/');  // Redir accueil
    } 
    catch (error) {
        console.error('Error diring deconnection :', error);
        localStorage.removeItem('access_token');// Nettoie stockage local
        navigate('/');
    }
}
