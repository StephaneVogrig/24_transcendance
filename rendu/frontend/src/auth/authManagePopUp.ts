import { notifyAuthStateChange } from './authStateChange.ts'; // Importer la fonction pour notifier les changements d'état d'authentification

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

export function createOAuthMessageListener( popup: Window, onSuccess: () => void, onError: (error: Error) => void, cleanup: () => void): (event: MessageEvent) => void {
   
    return (event: MessageEvent) => {
        console.log('Message received from popup:', event.data);

        if (event.origin !== window.location.origin) // Vérif origine -> sécurité
        {
            console.log('Message ignored - wrong origin:', event.origin);
            return;
        }
        
        if (event.data.type === 'OAUTH_SUCCESS') 
        {
            console.log('OAuth success received, cleaning up...');
            console.log('Token to save:', event.data.token ? event.data.token.substring(0, 20) + '...' : 'MISSING');
            cleanup(); // Nettoyer les listeners et intervalles
            
            if (!event.data.token) 
            {
                console.error('No token in success message');
                onError(new Error('Token manquant dans la réponse'));
                return;
            }
            
            if (!popup.closed) // Fermer la popup si elle tjrs ouverte
                closePopup(popup); 
            
            try 
            {
                localStorage.setItem('access_token', event.data.token); // Sauvegarde token
                console.log('Token saved to localStorage successfully');
                
                const savedToken = localStorage.getItem('access_token');// Vérif token a été sauvegardé
                if (savedToken === event.data.token) 
                {
                    console.log('Token verification successful');
                    notifyAuthStateChange(); // Notifier le changement d'état d'authentification
                    onSuccess();
                } 
                else
                {
                    console.error('Token verification failed');
                    throw new Error('Erreur lors de la sauvegarde du token');
                }
            } 
            catch (e) {
                console.error('Error saving token to localStorage:', e);
                onError(new Error('Erreur lors de la sauvegarde du token'));
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
                console.error('OAuth error - rejecting promise:', error);
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
                    // reject(new Error('Connexion annulée par l\'utilisateur'));
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
            // reject(new Error('Timeout de connexion (5 minutes)'));
        }, 300000);
    });
}
