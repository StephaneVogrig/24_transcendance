/**
 * Utilitaires pour gérer les popups d'authentification
 */

/**
 * Vérifie si les popups sont supportées et non bloquées
 */
export const isPopupSupported = (): boolean => {
    try {
        // Tenter d'ouvrir une popup de test
        const popup = window.open('', 'popup-test', 'width=1,height=1');
        if (popup) {
            popup.close();
            return true;
        }
        return false;
    } catch (error) {
        console.warn('Popups non supportées:', error);
        return false;
    }
};

/**
 * Vérifie si les popups sont bloquées par le navigateur
 */
export const isPopupBlocked = (): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            const popup = window.open('about:blank', 'popup-test', 'width=100,height=100');
            
            if (!popup) {
                resolve(true);
                return;
            }
            
            // Vérifier si la popup est vraiment ouverte
            setTimeout(() => {
                try {
                    if (popup.closed || !popup.location) {
                        resolve(true);
                    } else {
                        popup.close();
                        resolve(false);
                    }
                } catch (error) {
                    popup.close();
                    resolve(true);
                }
            }, 100);
            
        } catch (error) {
            resolve(true);
        }
    });
};

/**
 * Affiche un message à l'utilisateur pour débloquer les popups
 */
export const showPopupBlockedMessage = (): void => {
    const message = `
Pour utiliser l'authentification Google, veuillez autoriser les popups pour ce site.

Instructions :
1. Cliquez sur l'icône de popup bloquée dans la barre d'adresse
2. Sélectionnez "Toujours autoriser les pop-ups"
3. Rechargez la page et réessayez

Ou utilisez le fallback de redirection si disponible.
    `;
    
    alert(message);
};

/**
 * Detecte le type d'erreur de popup et retourne un message approprié
 */
export const getPopupErrorMessage = (error: Error): string => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('popup_closed_by_user')) {
        return 'Connexion annulée par l\'utilisateur';
    }
    
    if (errorMessage.includes('popup_blocked') || errorMessage.includes('blocked')) {
        return 'Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.';
    }
    
    if (errorMessage.includes('popup_timeout')) {
        return 'La connexion a pris trop de temps. Veuillez réessayer.';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'Erreur réseau. Vérifiez votre connexion internet.';
    }
    
    return 'Erreur lors de la connexion. Veuillez réessayer.';
};
