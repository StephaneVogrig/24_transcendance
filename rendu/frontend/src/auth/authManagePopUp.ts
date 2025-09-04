import { notifyAuthStateChange } from './authStateChange.ts'; // Importer la fonction pour notifier les changements d'état d'authentification

import { API_BASE_URL, GOOGLE_REDIRECT_URI } from '../config.ts';

// Interface pour la popup OAuth
interface PopupResources {
    intervalId: number | null; // ID de l'intervalle vérif la fermeture popup
    messageListener: ((event: MessageEvent) => void) | null; // Fonction qui écoute les messages de la popup
}

/**
 * Ferme la popup avec plusieurs méthodes de fallback
 */
export function closePopup(popup: Window): void {
    try 
    {
        console.log('Closing popup');

        popup.close();
        setTimeout(() => {
            if (!popup.closed) 
            {
                console.log('Popup still open, trying to force close...');
                try 
                {
                    popup.location.href = 'about:blank';
                    popup.close();
                } 
                catch (e) {
                    console.warn('Could not force close popup:', e);
                }
            }
        }, 200);
    } 
    catch (e) {
        console.error('Error closing popup:', e);
    }
}


export function cleanupPopupResources(resources: PopupResources): void {
    console.log('Cleaning up OAuth popup resources...');
    
    if (resources.intervalId) 
    {
        clearInterval(resources.intervalId);
        resources.intervalId = null;
        console.log('Interval cleared');
    }
    
    if (resources.messageListener) 
    {
        window.removeEventListener('message', resources.messageListener);
        resources.messageListener = null;
        console.log('Message listener removed');
    }
}

function checkState(receivedState: string): void {
    // Vérification du state -> securite CSRF
    // compare avec le state localStorage
    const savedState = localStorage.getItem('oauth_state');

    if (!savedState)
    {
        console.error('Aucun state sauvegardé trouvé dans localStorage');
        throw new Error('État OAuth manquant - Veuillez réessayer la connexion');
    }
    console.log('Saved state:', savedState);
    console.log('States match:', savedState === receivedState);

    // Ajout verif state que l'on a envoyé et celui reçu dans le callback
    // j'avais oublié de faire la vérif ... -_-
    if (savedState !== receivedState)
    {
        console.error('States do not match:', { saved: savedState, received: receivedState });
        throw new Error('État OAuth invalide - Possible attaque CSRF détectée');
    }
    localStorage.removeItem('oauth_state'); // Nettoyer le state du stockage
}

async function changeCodeByToken(receivedCode: string): Promise<void> {
    // Échanger le code contre un User token -> fait dans le backend
    try {
        const response = await fetch(`${API_BASE_URL}/authentification/oauth/googleCodeToTockenUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: receivedCode,
                redirect_uri: GOOGLE_REDIRECT_URI,
            })
        });

        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', response.headers);

        if (!response.ok) // probleme recup du token avec le code ou pb recup info utilisateur API Google
        {
            const errorData = await response.text();
            // Utiliser text() au lieu de json() pour voir le contenu exact
            console.error('Backend error response:', errorData);
            console.error('Response status:', response.status);
            console.error('Response statusText:', response.statusText);

            let parsedError;
            try {
                parsedError = JSON.parse(errorData);
            } catch (error) {
                parsedError = { message: errorData };
            }

            // Parse le message d'erreur pour avoir tout les details
            const errorMessage = parsedError.message || errorData || `Erreur HTTP ${response.status}: ${response.statusText}`;
            throw new Error(`POPUP Backend Error: ${errorMessage} (Status: ${response.status})`);
        }

        // Réponse du backen authentification -> token d'accès
        const data = await response.json();
        console.log('OAuth success data:', data);

        if (!data.access_token)
            throw new Error('Token d\'accès manquant dans la réponse du serveur');
        // Sauvegarde du token
        localStorage.setItem('access_token', data.access_token);
        console.log('Token d\'accès sauvegardé avec succès.');
        notifyAuthStateChange(); // Notifier le changement d'état d'authentification
    } catch (error) {
        console.error('Erreur lors de l\'échange du code:', error);
        throw error;
    }
}

export function createOAuthMessageListener(
    popup: Window,
    onSuccess: () => void,
    onError: (error: Error) => void,
    cleanup: () => void
): (event: MessageEvent) => void {
   
    return async (event: MessageEvent) => {
        console.log('Message received from popup:', event.data);

        if (event.origin !== window.location.origin) // Vérif origine -> sécurité
        {
            console.log('Message ignored - wrong origin:', event.origin);
            return;
        }
        
        if (event.data.type === 'OAUTH_SUCCESS') 
        {
            console.debug('OAuth success received');

            const receivedCode = event.data.code;
            const receivedState = event.data.state;
            try {
            checkState(receivedState);
            await changeCodeByToken(receivedCode);

            cleanup(); // Nettoyer les listeners et intervalles
            
            if (!popup.closed) // Fermer la popup si elle tjrs ouverte
                closePopup(popup); 
            onSuccess();
            } catch (error) {
                console.error('Erreur dans le processus OAuth:', error);
                cleanup();
                if (!popup.closed) {
                    closePopup(popup);
                }
                onError(error as Error);
            }
            
        } 
        else if (event.data.type === 'OAUTH_ERROR') 
        {
            console.log('OAuth error received:', event.data.error);
            cleanup();
            
            if (!popup.closed)
                popup.close();

            onError(new Error(event.data.error));
        }
    };
}

export function handlePopupResponse(popup: Window): Promise<void> {

// new Promise((resolve, reject)  =  crée Promisepour gérer état connexion
// resolve -> fonction qui sera appelée si succès
// reject -> fonction qui sera appelée si erreur

    return new Promise((resolve, reject) => {
        const resources: PopupResources = {
            intervalId: null, //Stock ID setInterval -init null-  -> window.setInterval()
            messageListener: null //Stockefonction d'écoute des msg
        };

        // Fonction de nettoyage
        const cleanup = () => cleanupPopupResources(resources);
        
        // Créer le gestionnaire de messages
        resources.messageListener = createOAuthMessageListener( popup,
            () => {
                console.log('OAuth success - resolving promise');
                resolve();
            },
            (error) => {
                console.log('OAuth error - rejecting promise:', error);
                reject(error);
            },
            cleanup
        );

        // on met un event listener sur la fenetre entière (ecouye popup)
        window.addEventListener('message', resources.messageListener);

        // Check fermeture manuelle de la popup
        // window.setInterval(func, delay)
        // func instruction à exécuter toutes delayl millisecondes
        resources.intervalId = window.setInterval(() => {
            console.log('Checking if popup is closed for 5 minutes max then close it');
            if (popup.closed) 
            {
                console.log('Popup was closed manually');
                cleanup();
                
                const tempToken = localStorage.getItem('oauth_temp_token');
                if (tempToken) // Vérif si token reçu de la popup
                {
                    console.log('Found temp token, using it...');
                    localStorage.removeItem('oauth_temp_token');
                    localStorage.setItem('access_token', tempToken);
                    notifyAuthStateChange();
                    resolve();
                } 
                else 
                {
                    console.log('No temp token found, connection cancelled');
                    return;
                }
            }
        }, 1000);

        // Timeout de 5 minutes -> si boucles infinie
        setTimeout(() => {
            console.log('OAuth timeout reached');
            cleanup();
            if (!popup.closed)
                closePopup(popup);
        }, 300000);
    });
}
