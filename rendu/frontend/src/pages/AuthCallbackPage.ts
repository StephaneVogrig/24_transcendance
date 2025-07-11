import { handleAuthCallback } from '../auth/auth0Service';

export const AuthCallbackPage = (_pathParams?: Record<string, string>, queryParams?: Record<string, string>): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100';

    // Gérer le callback Auth0
    const processCallback = async () => {
        try {
            const code = queryParams?.code;

            if (code) {
                console.log("Code d'authentification reçu :", code);
                await handleAuthCallback(code);
            } else {
                console.warn("Aucun code d'authentification trouvé dans l'URL.");
            }
        } catch (error) {
            console.error('Erreur lors du callback Auth0:', error);
        }
    };

    // Démarrer le traitement du callback
    processCallback();

    return mainDiv;
};
