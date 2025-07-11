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
                console.log(`Envoi du tocken: ${code}`);
                console.log(`Window.location.hostname: ${window.location.hostname}`);
                
                // Envoyer le token au backend
                const response = await fetch(`http://${window.location.hostname}:3001/api/auth`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tocken_code: code })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Token envoyé avec succès:', result);
                    // TODO: Rediriger vers la page d'accueil ou profil
                } else {
                    const error = await response.json();
                    console.error('Erreur lors de l\'envoi du token:', error);
                }
                
                // await handleAuthCallback(code);
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
