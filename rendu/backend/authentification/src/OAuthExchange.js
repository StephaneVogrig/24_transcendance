/**
 * Module pour gérer l'échange de code d'autorisation OAuth2 Google
 */

/**
 * Échange un code d'autorisation contre un access token Google
 * @param {string} authorizationCode - Le code d'autorisation reçu de Google
 * @returns {Promise<string>} L'access token Google
 * @throws {Error} Si l'échange échoue
 */
async function exchangeCodeForToken(authorizationCode) {
    if (!authorizationCode) {
        throw new Error('Authorization code is required');
    }

    // Configuration OAuth2 Google (ces valeurs devraient être dans les variables d'environnement)
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '316874582743-ntu3nvld3lh4iodhmjup7uj836eujt0g.apps.googleusercontent.com';
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback';

    try {
        // Faire la requête d'échange du code contre un token
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: authorizationCode,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }).toString()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const tokenData = await response.json();
        
        if (!tokenData.access_token) {
            throw new Error('No access token received in response');
        }

        console.log('Token exchange successful:', {
            access_token: tokenData.access_token.substring(0, 10) + '...',
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in
        });

        return tokenData.access_token;

    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
}

export { exchangeCodeForToken };
