

async function performDatabaseSave(userData) 
{
    const { email, nickname, picture, givenName, familyName, provider_id, status } = userData;

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
            provider: 'authGoogle',
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
        
    console.log('User saved or updated:', result.message);
    return result.user;
}    


//Sauvegarde ou met à jour un utilisateur OAuth en base de données
//  param {Object} -> userInfo -> informations utilisateur 
//  returns {Promise<Object>} -> utilisateur sauvegardé
//  throws {Error} -> sauvegarde échoue

export async function saveAuthUserToDatabase(userInfo)
{
    if (!userInfo) 
        throw new Error('User information is required');

    const { sub: provider_id, email, nickname, picture, givenName, familyName, status } = userInfo;

    if (!provider_id || !email || !nickname) 
        throw new Error('Missing required user fields: sub (provider_id), email, nickname');

    console.log(`Saving user to database: `, userInfo);

    try 
    {
           const userSaved = await performDatabaseSave({
            email,
            nickname,
            picture,
            givenName,
            familyName,
            provider_id,
            status
        });
        return userSaved;
    } 
    catch (error) {
        console.error('Error saving user to database:', error);
        throw new Error(`Failed to save user: ${error.message}`);
    }
}
