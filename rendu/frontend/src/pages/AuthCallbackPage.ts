import { handleAuthCallback } from '../auth/auth0Service';

export const AuthCallbackPage = (_pathParams?: Record<string, string>, _queryParams?: Record<string, string>): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100';

    // Créer un message de statut
    const statusDiv = document.createElement('div');
    statusDiv.className = 'text-center p-8 bg-white rounded-lg shadow-lg';
    statusDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Traitement de l'authentification...</p>
    `;
    mainDiv.appendChild(statusDiv);

    // Gérer le callback Auth0
    const processCallback = async () => {
        try {
            // Utiliser Auth0 pour gérer le callback
            await handleAuthCallback('');
            
            // Redirection 
            window.location.replace('/profile');
            
        } catch (error) {
            console.error('Erreur lors du callback Auth0:', error);
            statusDiv.innerHTML = `
                <div class="text-red-600 text-center">
                    <p class="font-bold mb-2">Erreur d'authentification</p>
                    <p class="text-sm">Redirection vers la page de connexion...</p>
                </div>
            `;
            
            // Redirection vers la page de connexion après 3 secondes
            setTimeout(() => {
                window.location.replace('/login');
            }, 3000);
        }
    };

    // Démarrer le traitement du callback
    processCallback();

    return mainDiv;
};
