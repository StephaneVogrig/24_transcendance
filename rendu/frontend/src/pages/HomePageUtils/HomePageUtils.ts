import { getActivePlayersFromDb } from '../HomePageUtils/dbServices.ts';
import { locale } from '../../i18n';


// Vérifier si le nom existe déjà dans la liste des joueurs actifs
export async function isAnActivePlayer(name: string) : Promise<boolean>
{
    
	const activePlayerList = await getActivePlayersFromDb();
	console.log('Active players from DB:', activePlayerList);

	if (activePlayerList.some(player => player.username === name)) 
	{
		alert(locale.UserInTournament || 'Username already in tournament');
		return false;
	}
	return true;
}


// type Player = { username: string };

// export async function isAnActivePlayer(name: string): Promise<boolean> {
// 	const activePlayerList: Player[] = await getActivePlayersFromDb();
// 	console.log('Active players from DB:', activePlayerList);

// 	if (activePlayerList.some((player: Player) => player.username === name)) 
// 	{
// 		alert(locale.UserInTournament || 'Username already in tournament');
// 		return false;
// 	}
// 	return true;
// }
