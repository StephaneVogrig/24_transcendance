import { isAuthenticated } from './auth0Service';
import { navigate } from '../router';

/**
 * Vérifie si l'utilisateur est authentifié et redirige vers /login sinon
 */
export const requireAuth = async (): Promise<boolean> => {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            console.log('Utilisateur non authentifié, redirection vers /login');
            navigate('/login');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        navigate('/login');
        return false;
    }
};

/**
 * Wrapper pour les pages qui nécessitent une authentification
 */
export const withAuthGuard = (pageComponent: () => HTMLElement) => {
    return async (): Promise<HTMLElement> => {
        const isAuth = await requireAuth();
        if (isAuth) {
            return pageComponent();
        } else {
            // Retourner une page de chargement pendant la redirection
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'min-h-screen flex items-center justify-center';
            loadingDiv.innerHTML = `
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Vérification de l'authentification...</p>
                </div>
            `;
            return loadingDiv;
        }
    };
};


// const AUTH0_DOMAIN = 'dev-yo45rdk5nhctgvu2.eu.auth0.com';
// const AUTH0_CLIENT_ID = 'VksN5p5Q9jbXcBAOw72RLLogClp44FVH';


// // --- Add this block to AuthGuard.ts ---
// // Listener for cross-tab logout using BroadcastChannel
// try {
//     const logoutChannel = new BroadcastChannel('auth_logout_channel');
//     logoutChannel.onmessage = (event) => {
//         if (event.data === 'logout') {
//             console.log('Received logout message from another tab. Forcing logout/refresh on this tab.');
//             // Clear local storage and navigate to login
//             // You might want to call clearLocalAuth() here too,
//             // though Auth0's logout (which triggered the broadcast) should have done it.
//             localStorage.clear(); // Ensure all local state is gone
//             sessionStorage.clear();
//             navigate('/login');
//             // Optionally, force a full reload: window.location.reload();
//         }
//     };
// } catch (error) {
//     console.warn('BroadcastChannel not supported or error:', error);
// }

// // Listener for cross-tab logout using window.onstorage
// window.addEventListener('storage', (event) => {
//     // Check for Auth0's local storage keys. The exact key might vary slightly,
//     // but usually contains the client ID and domain.
//     // Example: @@auth0spajs@@::VksN5p5Q9jbXcBAOw72RLLogClp44FVH::dev-yo45rdk5nhctgvu2.eu.auth0.com::openid profile email
//     const auth0LocalStorageKey = `@@auth0spajs@@::${AUTH0_CLIENT_ID}::${AUTH0_DOMAIN}::openid profile email`; // You'll need to import AUTH0_CLIENT_ID and AUTH0_DOMAIN from auth0Service.ts
    
//     // If Auth0's main token/state key is removed or changed in another tab
//     if (event.key && event.key === auth0LocalStorageKey && !event.newValue) {
//         console.log('Auth0 state cleared in another tab via localStorage event. Forcing logout/refresh.');
//         // Clear anything else just in case and navigate
//         localStorage.clear();
//         sessionStorage.clear();
//         navigate('/login');
//     }
//     // A broader check: if any Auth0-related key is removed
//     if (event.key && event.key.startsWith('@@auth0spajs@@') && !event.newValue) {
//         console.log('An Auth0 key was removed in another tab. Forcing logout/refresh.');
//         localStorage.clear();
//         sessionStorage.clear();
//         navigate('/login');
//     }
// });
