
export async function getAuthUserInfoInDB(nickname)
{
    console.log('getAuthUserInfoInDB called with nickname:', nickname);
   try
   {
    //                  await fetch(`http://database:3003/getUserInDB <- Manque le paramètre nickname

       const response = await fetch(`http://database:3003/getUserInDB?nickname=${encodeURIComponent(nickname)}`, {
           method: 'GET',
           headers: { 'Content-Type': 'application/json' }
       });

       if (!response.ok)
       {
           const err = await response.text();
           throw new Error(err);
       }

       // Méthode qui lit la réponse HTTP via `fetch` et le convertit en objet JavaScript
       const userInfo = await response.json();
      
       return userInfo;
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

