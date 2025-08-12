import { handleOAuthCallback } from '../auth/googleAuth';
import { navigate } from '../router';

export function createAuthCallbackPage(): HTMLElement {
    const callbackContainer = document.createElement('div');
    callbackContainer.className = 'min-h-screen flex items-center justify-center bg-gray-50';
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'text-center';
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Traitement de l'authentification...</p>
    `;
    
    callbackContainer.appendChild(loadingDiv);
    
    // Traiter le callback OAuth automatiquement
    setTimeout(async () => {
        try {
            const result = await handleOAuthCallback();
            
            if (result.success && result.user) {
                // Rediriger vers le profil en cas de succès
                navigate('/profile');
            } else {
                // Afficher l'erreur et rediriger vers l'accueil
                loadingDiv.innerHTML = `
                    <div class="text-red-600 mb-4">
                        <p>Erreur d'authentification: ${result.error || 'Erreur inconnue'}</p>
                    </div>
                    <p class="text-gray-600">Redirection vers l'accueil...</p>
                `;
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (error) {
            console.error('Erreur lors du traitement du callback:', error);
            loadingDiv.innerHTML = `
                <div class="text-red-600 mb-4">
                    <p>Erreur lors de l'authentification</p>
                </div>
                <p class="text-gray-600">Redirection vers l'accueil...</p>
            `;
            setTimeout(() => navigate('/'), 3000);
        }
    }, 1000);
    
    return callbackContainer;
}
