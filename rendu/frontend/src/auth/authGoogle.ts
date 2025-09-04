import { API_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../config';
import { navigate } from '../router';
import { handlePopupResponse } from './authManagePopUp';
import { notifyAuthStateChange } from './authStateChange';
import { v4 as new_uuid } from 'uuid';

// Interface pour les informations utilisateur Google
export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
    family_name?: string;
}

interface StateObject {
  uuid: string;
  returnUrl: string;
}

// Génère le state parameter (sécurité CSRF)
function generateStateCode(): string {
    const stateObject: StateObject = {
        uuid: new_uuid(),
        returnUrl: window.location.href
    }
    const stateString: string = JSON.stringify(stateObject);
    return btoa(stateString);
}

// Génère l'URL d'autorisation Google OAuth 2.0
function buildAuthUrl(): string {
    const stateCode = generateStateCode(); // chaine aléatoire créé pour state -> secure
    
    // Utiliser localStorage au lieu de sessionStorage pour partager entre fenêtres
    sessionStorage.setItem('oauth_state', stateCode);

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        scope: 'openid profile email',
        response_type: 'code',
        state: stateCode, // pour securité verif dans la fenêtre de la popup
        access_type: 'offline',
        prompt: 'consent'
    });
    
    console.debug('OAuth URL params:', params.toString());
    console.debug('State saved to localStorage:', stateCode);

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function loginWithGoogle(): Promise<void> {
    try
    {
        const authUrl = buildAuthUrl(); // on cree URL d'autorisation pour Google OAuth

        console.debug('Google OAuth  URL:', authUrl);

        // config + ouverture popup
        const popupWidth = 500;
        const popupHeight = 600;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;
        const popup = window.open(authUrl, 'google-oauth',`width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`);
        
        if (!popup) 
        {
            throw new Error('Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.');
        }
        
        await handlePopupResponse(popup); //gestion popup
        console.debug('Popup closed successfully, user logged in'); // si connection réussie
    } 
    catch (error) {
        console.error('Error occurred on popup Google:', error);
        throw new Error('Failed to open Google popup');
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
