// Service Auth0 avec gestion d'erreur et fallback
let Auth0Client: any = null;

// Configuration Auth0 - à configurer avec vos vraies valeurs Auth0
// const AUTH0_DOMAIN = 'dev-transcendance.eu.auth0.com'; // Remplacez par votre domaine Auth0
const AUTH0_DOMAIN = 'dev-yo45rdk5nhctgvu2.eu.auth0.com'; // Remplacez par votre domaine Auth0
const AUTH0_CLIENT_ID = 'VksN5p5Q9jbXcBAOw72RLLogClp44FVH'; // Remplacez par votre Client ID Auth0
// const AUTH0_REDIRECT_URI = `${window.location.origin}/auth/callback`;
const AUTH0_REDIRECT_URI = `http://localhost:5173`;


let auth0Client: any = null;

/**
 * Charge dynamiquement Auth0 avec gestion d'erreur
 */
const loadAuth0 = async () => {
    try {
        if (!Auth0Client) {
            const auth0Module = await import('@auth0/auth0-spa-js');
            Auth0Client = auth0Module.Auth0Client;
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
            cacheLocation: 'localstorage'
        });
    }
    return auth0Client;
};

/**
 * Connexion avec Google OAuth via Auth0
 */
export const loginWithGoogle = async (): Promise<void> => {
    try {
        const client = await initAuth0();
        await client.loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
                redirect_uri: AUTH0_REDIRECT_URI
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion Google:', error);
        // Fallback : redirection vers une page d'erreur ou message
        alert('Service d\'authentification Google temporairement indisponible. Veuillez utiliser la connexion classique.');
    }
};

/**
 * Connexion universelle Auth0 (affiche toutes les options)
 */
export const loginWithAuth0 = async (): Promise<void> => {
    try {
        const client = await initAuth0();
        await client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: AUTH0_REDIRECT_URI
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion Auth0:', error);
        alert('Service d\'authentification temporairement indisponible. Veuillez utiliser la connexion classique.');
    }
};

/**
 * Gère le callback après authentification
 */
export const handleAuthCallback = async (code: string): Promise<void> => {
    console.log('code: ', code);
//    try {
//        const client = await initAuth0();
//        await client.handleRedirectCallback();
        
        // Rediriger vers la page principale après connexion
//        window.location.replace('/choice-game');
//    } catch (error) {
//        console.error('Erreur lors du callback Auth0:', error);
        // Rediriger vers la page de connexion en cas d'erreur
//        window.location.replace('/login');
//    }
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const client = await initAuth0();
        return await client.isAuthenticated();
    } catch (error) {
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
            return await client.getUser();
        }
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
};

/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
    try {
        const client = await initAuth0();
        await client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // Fallback : nettoyer le localStorage et rediriger
        localStorage.clear();
        window.location.replace('/login');
    }
};

/**
 * Récupère le token d'accès
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        const client = await initAuth0();
        const isAuth = await client.isAuthenticated();
        if (isAuth) {
            return await client.getTokenSilently();
        }
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        return null;
    }
};
