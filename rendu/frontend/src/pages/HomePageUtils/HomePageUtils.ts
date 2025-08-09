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

export const createNavLink = (text: string, route: string, loginLogout?: string): HTMLAnchorElement => {
	const link = document.createElement('a');
	link.href = '#'; // Le href est souvent un '#' ou le chemin réel pour l'accessibilité
	link.setAttribute('data-route', route);
	link.className = loginLogout || 'btn btn-secondary text-center';
	link.textContent = text;
	return link;
};
