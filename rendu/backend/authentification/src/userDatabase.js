/**
 * Module pour gérer les utilisateurs en base de données
 */

/**
 * Sauvegarde ou met à jour un utilisateur OAuth en base de données
 * @param {Object} userInfo - Les informations utilisateur d'Auth0
 * @returns {Promise<Object>} L'utilisateur sauvegardé
 * @throws {Error} Si la sauvegarde échoue
 */
async function saveUserToDatabase(userInfo) {
    if (!userInfo) {
        throw new Error('User information is required');
    }

    const { sub: provider_id, email, nickname, picture } = userInfo;

    if (!provider_id || !email || !nickname) {
        throw new Error('Missing required user fields: sub (provider_id), email, nickname');
    }

    try {
        console.log('Saving user to database:', { provider_id, email, nickname, picture });

        const response = await fetch(`http://database:3003/api/database/user/oauth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                nickname,
                picture,
                provider: 'auth0',
                provider_id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Database error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('User saved successfully:', result.message);
        
        return result.user;

    } catch (error) {
        console.error('Error saving user to database:', error);
        throw new Error(`Failed to save user: ${error.message}`);
    }
}

/**
 * Récupère un utilisateur par son Auth0 ID
 * @param {string} auth0_id - L'ID Auth0 de l'utilisateur
 * @returns {Promise<Object>} L'utilisateur trouvé
 * @throws {Error} Si l'utilisateur n'est pas trouvé
 */
async function getUserFromDatabase(auth0_id) {
    if (!auth0_id) {
        throw new Error('Auth0 ID is required');
    }

    try {
        console.log('Fetching user from database:', auth0_id);

        const response = await fetch(`http://database:3003/api/database/user/oauth/${encodeURIComponent(auth0_id)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (response.status === 404) {
            return null; // Utilisateur non trouvé
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Database error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('User found in database:', result.user.nickname);
        
        return result.user;

    } catch (error) {
        console.error('Error fetching user from database:', error);
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export { saveUserToDatabase, getUserFromDatabase };
