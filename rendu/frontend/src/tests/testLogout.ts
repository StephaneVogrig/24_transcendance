/**
 * Test de la déconnexion Auth0
 */

import { logout, isAuthenticated, getUser } from '../auth/auth0Service';

export async function testLogout(): Promise<void> {
    console.log('🧪 Test de déconnexion Auth0...');
    
    try {
        // 1. Vérifier le statut initial
        console.log('1. Vérification du statut initial...');
        const initialAuth = await isAuthenticated();
        console.log('Statut initial:', initialAuth ? 'Connecté' : 'Déconnecté');
        
        if (initialAuth) {
            const user = await getUser();
            console.log('Utilisateur actuel:', user?.name || 'Inconnu');
        }
        
        // 2. Tenter la déconnexion
        console.log('2. Tentative de déconnexion...');
        await logout();
        
        // 3. Cette partie ne s'exécutera que si logout() échoue
        // car normalement logout() redirige la page
        console.log('3. Vérification post-déconnexion...');
        const finalAuth = await isAuthenticated();
        console.log('Statut final:', finalAuth ? 'Connecté' : 'Déconnecté');
        
        if (!finalAuth) {
            console.log('✅ Déconnexion réussie');
        } else {
            console.log('❌ La déconnexion a échoué');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test de déconnexion:', error);
    }
}

// Test automatique si ce fichier est importé
if (typeof window !== 'undefined') {
    (window as any).testLogout = testLogout;
    console.log('Test de déconnexion disponible via: window.testLogout()');
}
