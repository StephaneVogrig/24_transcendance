let Auth0Client: any = null;
import { locale } from '../i18n';


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
        try {
            authMessageDiv.textContent = 'Redirection vers Google...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            
            // Utiliser Auth0 pour la connexion Google
            await loginWithGoogle();
        } catch (error) {
            console.error('Erreur lors de la connexion Google:', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    });
};


/**
 * Charge dynamiquement Auth0 avec gestion d'erreur
 */
//si pb -> npm install @auth0/auth0-spa-js
const loadAuth0 = async () => {
    try {
        if (!Auth0Client) {
            // Import dynamique avec fallback pour les types
            const auth0Module = await import('@auth0/auth0-spa-js') as any;
            Auth0Client = auth0Module.Auth0Client || auth0Module.default?.Auth0Client || auth0Module.default;
        }
        return Auth0Client;
    } catch (error) {
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
            useRefreshTokensFallback: false
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
        
        // Utiliser loginWithPopup au lieu de loginWithRedirect
        const result = await client.loginWithPopup({
            authorizationParams: {
                connection: 'google-oauth2',
                scope: 'openid profile email'
            },
            popup: {
                // Configuration de la popup
                timeoutInSeconds: 60,
                popup: null // Laisser Auth0 gérer la création de la popup
            }
        });
        
        console.log('Connexion popup réussie:', result);
        console.log('URL de callback:', window.location.href);
        
        // Vérifier l'authentification
        const isAuth = await client.isAuthenticated();
        if (isAuth) {
            const user = await client.getUser();
            console.log('Utilisateur connecté:', user);
            
            // Synchronisation avec le backend (optionnel)
            try 
            {
                const response = await fetch(`/api/authentification/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Informations utilisateur synchronisées avec le backend:', result);
                }
            }
            catch (error) {
                console.warn('Erreur lors de la synchronisation avec le backend:', error); // Non critique, continuer
            }
            
            // Rediriger vers la page d'accueil après connexion réussie
            window.location.href = '/';
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
export const isAuthenticated = async (): Promise<boolean> => {
    try 
    {
        const client = await initAuth0();
        return await client.isAuthenticated();
    } 
    catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        return false;
    }
};

/**
 * Récupère les informations de l'utilisateur
 */
export const getUser = async () => {
    try {
        const client = await initAuth0();
        const isAuth = await client.isAuthenticated();
        if (isAuth) {
            console.log('OAuth récupération des info utilisateur');
            return await client.getUser();
        }
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
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


/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
    try 
    {
        console.log('Début de la déconnexion...');
        const client = await initAuth0();
        
        clearLocalAuth();  // Nettoyer les données locales avant la déconnexion Auth0
        
        // Déconnexion Auth0 (redirige automatiquement)
        await client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
        
    }
    catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        
        clearLocalAuth();  // Fallback : nettoyer les données et rediriger manuellement
        
        // Essayer de rediriger vers Auth0 logout manuellement
        try {
            const logoutUrl = `https://dev-yo45rdk5nhctgvu2.eu.auth0.com/v2/logout?returnTo=${encodeURIComponent(window.location.origin)}&client_id=VksN5p5Q9jbXcBAOw72RLLogClp44FVH`;
            window.location.replace(logoutUrl);
        } catch (redirectError) {
            console.error('Erreur lors de la redirection manuelle:', redirectError);
            // Dernier recours : redirection locale
            window.location.replace('/login');
        }
    }
};

/**
 * Récupère le token d'accès
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        const client = await initAuth0();
        const isAuth = await client.isAuthenticated();
        if (isAuth) 
        {
            return await client.getTokenSilently();
        }
        return null;
    } 
    catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        return null;
    }
};



