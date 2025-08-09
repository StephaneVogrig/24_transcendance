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

export async function getActivePlayersFromDb(): Promise<any[]> 
{
	try 
	{
		const response = await fetch(`${API_BASE_URL}/database/getActivePlayers`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!response.ok) {
			const err = await response.text();
			console.error('Erreur de réponse:', err);
			throw new Error(`Failed to fetch active players: ${err}`);
		}
		const players = await response.json();
		return Array.isArray(players) ? players : [];
	} 
	catch (err: any) {
		console.error('Erreur complète:', err);
		throw new Error(`Database connection error: ${err?.message || err}`);
	}
}
