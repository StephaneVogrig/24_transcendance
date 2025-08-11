/**
 * Module pour gérer les utilisateurs en base de données
 */

/**
 * Sauvegarde ou met à jour un utilisateur OAuth en base de données
 * @param {Object} userInfo - Les informations utilisateur d'Auth0
 * @returns {Promise<Object>} L'utilisateur sauvegardé
 * @throws {Error} Si la sauvegarde échoue
 */
export async function saveUserToDatabase(userInfo) {
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

        const response = await fetch(`http://database:3003/manageUserInDB`, {
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

export async function getActiveUserInfoInDB()
{
   try
   {
       const response = await fetch(`http://database:3003/getActiveUserInDB`, {
           method: 'GET',
           headers: { 'Content-Type': 'application/json' }
       });

       if (!response.ok)
       {
           const err = await response.text();
           throw new Error(err);
       }

       // Méthode qui lit la réponse HTTP via `fetch` et le convertit en objet JavaScript
       const tournaments = await response.json();
      
       return tournaments;
   }
   catch (error) {
       console.log(`Error while fetching users list from database: ${error.message}.`);
       throw error;
   }
}

export async function getAllUserInfoInDB()
{
   try
   {
       const response = await fetch(`http://database:3003/getAllUserInDB`, {
           method: 'GET',
           headers: { 'Content-Type': 'application/json' }
       });

       if (!response.ok)
       {
           const err = await response.text();
           throw new Error(err);
       }

       // Méthode qui lit la réponse HTTP via `fetch` et le convertit en objet JavaScript
       const tournaments = await response.json();
      
       return tournaments;
   }
   catch (error) {
       console.log(`Error while fetching users list from database: ${error.message}.`);
       throw error;
   }
}

export async function updateLogStatusInDatabase(user) {
    if (!user || !user.nickname || !user.status) 
        throw new Error('User nickname and status are required');

    try 
    {
        console.log('Updating user status in database:', { nickname: user.nickname, status: user.status });

        const response = await fetch(`http://database:3003/updateUserLogStatusInDB`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nickname: user.nickname,
                status: user.status
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

        const result = await response.json();
        console.log('User status updated successfully:', result.message);
        
        return result;
    } 
    catch (error) {
        console.error('Error updating user status in database:', error);
        throw new Error(`Failed to update user status: ${error.message}`);
    }
}
