/**
 * Fichier de test pour la fonctionnalité popup Auth0
 * Ce fichier peut être supprimé une fois que tout fonctionne
 */

import { loginWithGoogle, isAuthenticated, getUser, logout } from './auth0Service';
import { isPopupSupported, isPopupBlocked } from './popupHelpers';

/**
 * Teste la fonctionnalité d'authentification popup
 */
export const testPopupAuth = async (): Promise<void> => {
    console.log('=== Test de l\'authentification popup ===');
    
    // Test 1: Vérifier le support des popups
    console.log('1. Support des popups:', isPopupSupported());
    
    // Test 2: Vérifier si les popups sont bloquées
    const popupBlocked = await isPopupBlocked();
    console.log('2. Popups bloquées:', popupBlocked);
    
    // Test 3: Vérifier l'état d'authentification
    const isAuth = await isAuthenticated();
    console.log('3. Utilisateur authentifié:', isAuth);
    
    if (isAuth) {
        const user = await getUser();
        console.log('4. Utilisateur actuel:', user);
    }
    
    console.log('=== Fin du test ===');
};

/**
 * Fonction utilitaire pour tester la connexion
 */
export const testLogin = async (): Promise<void> => {
    try {
        console.log('Tentative de connexion avec popup...');
        await loginWithGoogle();
        console.log('Connexion réussie!');
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
    }
};

/**
 * Fonction utilitaire pour tester la déconnexion
 */
export const testLogout = async (): Promise<void> => {
    try {
        console.log('Tentative de déconnexion...');
        await logout();
        console.log('Déconnexion réussie!');
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
};

// Exposition globale pour les tests en console
if (typeof window !== 'undefined') {
    (window as any).authTest = {
        testPopupAuth,
        testLogin,
        testLogout,
        isAuthenticated,
        getUser
    };
    
    console.log('Tests Auth0 disponibles via window.authTest');
    console.log('Utilisez window.authTest.testPopupAuth() pour tester');
}
