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
