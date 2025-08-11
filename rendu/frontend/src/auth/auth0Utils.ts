let Auth0Client: any = null;
import { locale } from '../i18n';
import { navigate } from '../router';

const AUTH0_DOMAIN = 'dev-yo45rdk5nhctgvu2.eu.auth0.com';
const AUTH0_CLIENT_ID = 'VksN5p5Q9jbXcBAOw72RLLogClp44FVH';
const AUTH0_REDIRECT_URI = `https://localhost:3000/auth/callback`;


let auth0Client: any = null;

export const authGoogleButton = (loginForm: HTMLElement, authMessageDiv: HTMLElement): void => {
    const googleButton = document.createElement('button');
    googleButton.id = 'google-oauth-btn';
    googleButton.className = 'w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200';
    googleButton.innerHTML = `
         <img class="w-5 h-5 mr-2" src="/assets/Google_logo.png" alt="Auth0 Logo" />
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
            await loginWithGoogle(); // Auth0 pour la connexion Google
        } 
        catch (error) {
            console.error('Erreur lors de la connexion Google:', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    });
};

async function sendUserInfoToBackend(user: any): Promise<void> 
{
    const response = await fetch(`/api/authentification/userRegistering`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user })});
    if (response.ok) 
    {
        await response.json();
    }
    else 
    {
        throw new Error('Erreur de synchronisation avec le backend');
    }
}

/**
 * Charge dynamiquement Auth0 avec gestion d'erreur
 */
//si pb -> npm install @auth0/auth0-spa-js
const loadAuth0 = async () => {
    try 
    {
        if (!Auth0Client) 
        {
            const auth0Module = await import('@auth0/auth0-spa-js') as any;
            Auth0Client = auth0Module.Auth0Client || auth0Module.default?.Auth0Client || auth0Module.default;
        }
        return Auth0Client;
    } 
    catch (error) {
        console.error('Erreur lors du chargement d\'Auth0:', error);
        throw new Error('Module Auth0 non disponible');
    }
};

/**
 * Initialise le client Auth0
 */
export const initAuth0 = async (): Promise<any> => {
    if (!auth0Client) {
        const Auth0ClientClass = await loadAuth0();
        auth0Client = new Auth0ClientClass({
            domain: AUTH0_DOMAIN,
            clientId: AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: AUTH0_REDIRECT_URI,
                scope: 'openid profile email'
            },
            cacheLocation: 'localstorage',
            // Configuration pour améliorer le support des popups
            useRefreshTokens: true,
            useRefreshTokensFallback: false,
            legacySameSiteCookie: true
        });
        console.log('Client Auth0 initialisé -> ', auth0Client);
    }
    return auth0Client;
};

/**
 * Connexion avec Google OAuth via Auth0 en popup
 */
export const loginWithGoogle = async (): Promise<void> => {
    try {
        const client = await initAuth0();
        
        // Utiliser loginWithPopup 
        const result = await client.loginWithPopup({
            authorizationParams: {
                connection: 'google-oauth2',
                scope: 'openid profile email',
                redirect_uri: AUTH0_REDIRECT_URI
            }
        });
    
        console.log('Connexion popup réussie:', result);
        console.log('URL:', window.location);
        console.log('URL actuelle:', window.location.href);
        console.log('client:', client);
        
        const isAuth = isSomeoneAuthenticated();
        if (isAuth)   // Vérifie l'authentification
        {
            const user = await client.getUser();
            console.log('Utilisateur récupéré:', user);

            // Enoie données utilisateur vers backend 
            try 
            {
                console.log('sending user info to backend for user:', user);
                sendUserInfoToBackend(user); // si new user créé, sinon mise à jour avec update status connected    
            }
            catch (error) {
                console.warn('Erreur lors de la synchronisation avec le backend:', error);
            }
            navigate('/');// Rediriger vers la page d'accueil après connexion réussie
        }
    } 
    catch (error) 
    {
        throw new Error('Service d\'authentification Google temporairement indisponible. Veuillez réessayer.');
    }
};


/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isSomeoneAuthenticated = (): boolean => 
{
    console.log('Vérification du localStorage pour l\'authentification...');
    if (localStorage.getItem('@@auth0spajs@@::VksN5p5Q9jbXcBAOw72RLLogClp44FVH::@@user@@') === null)
        return false;
    return true;
};


/**
 * Nettoie les données d'authentification locales
 */
export const clearLocalAuth = (): void => {
    try 
    {
        localStorage.clear(); // Nettoyer tout le localStorage 
        sessionStorage.clear();// Nettoyer le sessionStorage
        console.log('Données d\'authentification locales nettoyées');
    }
    catch (error) {
        console.error('Erreur lors du nettoyage des données locales:', error);
    }
};

async function updateLogStatus(status: string, nickname: string): Promise<void> {
    try 
    {
        console.log('Mise à jour du statut utilisateur:', status, nickname);

        const response = await fetch(`/api/authentification/LogStatus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, nickname })
        });
        if (!response.ok) 
        {
            throw new Error(`Erreur lors de la mise à jour du statut utilisateur: ${response.statusText}`);
        }
        console.log('Statut utilisateur mis à jour avec succès:', status);
    } 
    catch (error) {
        console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    }
}

/**
 * Déconnexion
 */
export const logoutGoogleNickname = async (nickname: string): Promise<void> => {
    try 
    {
        console.log('Début de la déconnexion de...', nickname);

        await updateLogStatus('deconnected', nickname); 

        const client = await initAuth0();
        console.log('Client Auth0 récupéré pour la déconnexion:', client);
        clearLocalAuth();

        await client.logout({
            openUrl: false
        });
        
        console.log('Déconnexion réussie');
        navigate('/profile');
    }
    catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        clearLocalAuth();
        // Essayer de rediriger vers Auth0 logout manuellement
        try {
            const logoutUrl = `https://dev-yo45rdk5nhctgvu2.eu.auth0.com/v2/logout?returnTo=${encodeURIComponent(window.location.origin)}&client_id=VksN5p5Q9jbXcBAOw72RLLogClp44FVH`;
            window.location.replace(logoutUrl);
        } catch (redirectError) {
            console.error('Erreur lors de la redirection manuelle:', redirectError);
            navigate('/profile');
        }
    }
};

