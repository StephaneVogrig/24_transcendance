/**
 * Module pour gérer les tokens Google OAuth et récupérer les informations utilisateur
 */

/**
 * Récupère le nom de l'utilisateur à partir du token Google OAuth
 * @param {string} token - Le token Google OAuth
 * @returns {Promise<string>} Le nom de l'utilisateur
 * @throws {Error} Si le token est invalide ou vide
 */
async function ManageTockenGetName(token) {
    // Validation du token
    if (!token) {
        throw new Error('Token cannot be empty');
    }

    if (typeof token !== 'string') {
        throw new Error('Token must be a string');
    }

    try {
        // Faire un appel à l'API Google pour récupérer les informations utilisateur
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Google API error: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        
        if (!userData.name) {
            throw new Error('Name not found in user data');
        }

        return userData.name;
    } catch (error) {
        console.error('Error fetching user name:', error);
        throw new Error(`Failed to retrieve user name: ${error.message}`);
    }
}

/**
 * Récupère l'email de l'utilisateur à partir du token Google OAuth
 * @param {string} token - Le token Google OAuth
 * @returns {Promise<string>} L'email de l'utilisateur
 * @throws {Error} Si le token est invalide ou null
 */
async function ManageTockenGetEmail(token) {
    // Validation du token
    if (token === null || token === undefined) {
        throw new Error('Token cannot be null');
    }

    if (!token) {
        throw new Error('Token cannot be empty');
    }

    if (typeof token !== 'string') {
        throw new Error('Token must be a string');
    }

    try {
        // Faire un appel à l'API Google pour récupérer les informations utilisateur
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Google API error: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        
        if (!userData.email) {
            throw new Error('Email not found in user data');
        }

        return userData.email;
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw new Error(`Failed to retrieve user email: ${error.message}`);
    }
}

/**
 * Récupère les informations complètes de l'utilisateur (nom et email)
 * @param {string} token - Le token Google OAuth
 * @returns {Promise<{name: string, email: string}>} Les informations de l'utilisateur
 * @throws {Error} Si le token est invalide
 */
async function ManageTockenGetUserInfo(token) {
    // Validation du token
    if (!token) {
        throw new Error('Token cannot be empty');
    }

    try {
        // Faire un appel à l'API Google pour récupérer les informations utilisateur
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Google API error: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        
        return {
            name: userData.name || 'Unknown',
            email: userData.email || 'Unknown',
            id: userData.id || null,
            picture: userData.picture || null
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error(`Failed to retrieve user info: ${error.message}`);
    }
}

export {
    ManageTockenGetName,
    ManageTockenGetEmail,
    ManageTockenGetUserInfo
};