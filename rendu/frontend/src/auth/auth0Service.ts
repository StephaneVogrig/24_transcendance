import { createAuth0Client } from '@auth0/auth0-spa-js';

// Service Auth0 avec gestion d'erreur et fallback
let auth0Client: any = null;

export const initAuth0 = async () => {
    try {
        // Vérifier que les variables sont définies
        const domain = import.meta.env.VITE_AUTH0_DOMAIN;
        const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin + '/auth/callback';
        
        if (!domain || !clientId) {
            console.error('Variables d\'environnement manquantes:', { domain, clientId });
            throw new Error('Variables d\'environnement Auth0 manquantes');
        }
        
        console.log('Initialisation Auth0 avec:', { domain, clientId, redirectUri });
        
        auth0Client = await createAuth0Client({
            domain: domain,
            clientId: clientId,
            authorizationParams: {
                redirect_uri: redirectUri,
                audience: `https://${domain}/api/v2/`
            }
        });
        
        return auth0Client;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation d\'Auth0:', error);
        return null;
    }
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
                redirect_uri: 'http://localhost:5173/auth/callback'
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
                redirect_uri: 'http://localhost:5173/auth/callback'
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
export const handleAuthCallback = async (_code: string): Promise<void> => {
    console.log('Gestion du callback Auth0...');
    try {
        const client = await initAuth0();
        await client.handleRedirectCallback();
        
        // Vérifier si l'utilisateur est bien authentifié
        const isAuth = await client.isAuthenticated();
        if (isAuth) {
            console.log('Authentification réussie');
            const user = await client.getUser();
            console.log('Utilisateur:', user);
            
            // Optionnel : envoyer les informations utilisateur au backend
            await client.getTokenSilently();
            console.log('Token Auth0 récupéré');
            
            // Envoyer les informations utilisateur au backend pour synchronisation
            try {
                const response = await fetch(`http://${window.location.hostname}:3001/api/auth/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Informations utilisateur synchronisées avec le backend:', result);
                } else {
                    console.warn('Échec de la synchronisation avec le backend');
                }
            } catch (error) {
                console.warn('Erreur lors de la synchronisation avec le backend:', error);
                // Ce n'est pas critique, l'authentification peut continuer
            }
            
        } else {
            throw new Error('Échec de l\'authentification');
        }
        
    } catch (error) {
        console.error('Erreur lors du callback Auth0:', error);
        throw error;
    }
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
            console.error('OAuth récupération des info utilisateur');
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
    try {
        // Nettoyer le localStorage
        localStorage.removeItem('@@auth0spajs@@::VksN5p5Q9jbXcBAOw72RLLogClp44FVH::dev-yo45rdk5nhctgvu2.eu.auth0.com::openid profile email');
        localStorage.removeItem('a0.spajs.txs');
        localStorage.clear(); // Nettoyer tout le localStorage en dernier recours
        
        // Nettoyer le sessionStorage
        sessionStorage.clear();
        
        console.log('Données d\'authentification locales nettoyées');
    } catch (error) {
        console.error('Erreur lors du nettoyage des données locales:', error);
    }
};

/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
    try {
        console.log('Début de la déconnexion...');
        const client = await initAuth0();
        
        // Nettoyer les données locales avant la déconnexion Auth0
        clearLocalAuth();
        
        // Déconnexion Auth0 (redirige automatiquement)
        await client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        
        // Fallback : nettoyer les données et rediriger manuellement
        clearLocalAuth();
        
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

//  export const logout = () => {
//         auth0Client.logout({
//             logoutParams: {
//             returnTo: window.location.origin
//             }
//         });
//         }

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



