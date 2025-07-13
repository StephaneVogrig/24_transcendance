/**
 * Script de test pour vérifier la sauvegarde des utilisateurs
 */

import { saveUserToDatabase, getUserFromDatabase } from './userDatabase.js';

// Fonction pour tester la sauvegarde d'un utilisateur
async function testUserSave() {
    console.log('🧪 Test de sauvegarde utilisateur...');
    
    // Utilisateur de test (format Auth0)
    const testUser = {
        sub: 'auth0|test123456789',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://avatars.githubusercontent.com/u/test',
        email_verified: true
    };

    try {
        // Test de sauvegarde
        console.log('📝 Sauvegarde de l\'utilisateur de test...');
        const savedUser = await saveUserToDatabase(testUser);
        console.log('✅ Utilisateur sauvegardé:', savedUser);

        // Test de récupération
        console.log('🔍 Récupération de l\'utilisateur...');
        const fetchedUser = await getUserFromDatabase(testUser.sub);
        console.log('✅ Utilisateur récupéré:', fetchedUser);

        // Test de mise à jour
        console.log('🔄 Test de mise à jour...');
        const updatedTestUser = {
            ...testUser,
            name: 'Test User Updated',
            picture: 'https://new-avatar.com/test'
        };
        
        const updatedUser = await saveUserToDatabase(updatedTestUser);
        console.log('✅ Utilisateur mis à jour:', updatedUser);

        console.log('🎉 Tous les tests passés avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Lancer les tests si ce fichier est exécuté directement
if (process.argv[1].includes('testUserDatabase.js')) {
    testUserSave();
}

export { testUserSave };
