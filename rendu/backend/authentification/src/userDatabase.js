/**
 * Module pour gérer les utilisateurs en base de données
 */

/**
 * Sauvegarde ou met à jour un utilisateur OAuth en base de données
 * @param {Object} userInfo - Les informations utilisateur d'Auth0
 * @returns {Promise<Object>} L'utilisateur sauvegardé
 * @throws {Error} Si la sauvegarde échoue
 */
export async function saveAuthUserToDatabase(userInfo) {
    if (!userInfo) 
        throw new Error('User information is required');

    const { sub: provider_id, email, nickname, picture, givenName, familyName, status } = userInfo;

    if (!provider_id || !email || !nickname) 
        throw new Error('Missing required user fields: sub (provider_id), email, nickname');

    console.log(`Saving user to database: `, userInfo);
    console.log(`provider_id, email, nickname, `, { provider_id, email, nickname });
    console.log(` picture, givenName, familyName, status `, { picture, givenName, familyName, status });

    try 
    {
        console.log('Saving user to database:', { provider_id, email, nickname, picture, givenName, familyName, status });

        const response = await fetch(`http://database:3003/manageAuthUserInDB`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                nickname,
                picture,
                givenName,
                familyName,
                provider: 'auth0',
                provider_id,
                status
            })
        });

        if (!response.ok) 
        {
            let errorData;
            try 
            {
                errorData = await response.json();
            } 
            catch (parseError) {
                console.error('Could not parse error response:', parseError);
                throw new Error(`Database error: ${response.status} ${response.statusText}`);
            }
            throw new Error(`Database error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        let result;
        try 
        {
            result = await response.json();
        } 
        catch (parseError) {
            console.error('Could not parse response:', parseError);
            throw new Error('Invalid JSON response from database service');
        }
        
        console.log('User saved successfully:', result.message);
        
        return result.user;
    } 
    catch (error) {
        console.error('Error saving user to database:', error);
        throw new Error(`Failed to save user: ${error.message}`);
    }
}
