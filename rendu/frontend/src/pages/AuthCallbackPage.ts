// import { auth0Service } from '../auth/auth0Service';

export const AuthCallbackPage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'text-center';
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-lg text-gray-600">Connexion en cours...</p>
    `;
    
    mainDiv.appendChild(loadingDiv);

    // Le service Auth0 gère automatiquement le callback dans initialize()
    
    return mainDiv;
};
