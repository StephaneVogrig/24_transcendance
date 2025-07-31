import { API_BASE_URL } from '../../config.ts';

export async function registerUsernameToDb(username: string)
{
	try {
		const response = await fetch(`${API_BASE_URL}/database/addUser`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});
		if (!response.ok) {
			console.error('Erreur lors de la requête de register db:', response.statusText);
		}
		console.log(`Successfully added user ${username} to db`);
	} catch (error) {
		console.error('Error adding user to db:', error);
	}
}

export async function usernameExistsInDb(username: string) : Promise<Boolean>
{
	try {
		const response = await fetch(`${API_BASE_URL}/database/getUser?username=${username}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!response.ok) {
			console.error('Erreur lors de la requête de check username in db:', response.statusText);
			return false;
		}
		if (response.status === 204)
			return false;
		return true;
	} catch (error) {
		console.error('Error checking user to db:', error);
	}
	return false;
}

export async function deleteUsernameFromDb(username: string)
{
	try {
		const response = await fetch(`${API_BASE_URL}/database/removeUser`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});
		if (!response.ok) {
			console.error('Erreur lors de la requête de register db:', response.statusText);
		}
		console.log(`Successfully added user ${username} to db`);
	} catch (error) {
		console.error('Error adding user to db:', error);
	}
}
