import { handleAuthCallback } from '../auth/auth0Service';

export const AuthCallbackPage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl text-center';
    mainDiv.appendChild(cardDiv);

    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentification en cours...</h2>
        <p class="text-gray-600">Veuillez patienter pendant que nous vous connectons.</p>
    `;
    cardDiv.appendChild(loadingDiv);

    // Gérer le callback Auth0
    const processCallback = async () => {
        try {
            await handleAuthCallback();
        } catch (error) {
            console.error('Erreur lors du callback Auth0:', error);
            
            // Afficher une erreur
            loadingDiv.innerHTML = `
                <div class="text-red-600 mb-4">
                    <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur d'authentification</h2>
                <p class="text-gray-600 mb-4">Une erreur s'est produite lors de la connexion.</p>
                <button onclick="window.location.href='/login'" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Retourner à la connexion
                </button>
            `;
        }
    };

    // Démarrer le traitement du callback
    processCallback();

    return mainDiv;
};
