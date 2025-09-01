import { createCard } from './matchDisplayCards';
import { modalMessage } from '../components/modalMessage';
import { locale } from '../../i18n';

const winnerName = (round: any) =>
{
    if (round.length > 1)
        return null;
    else
        return( round[0][0].score > round[0][1].score ? round[0][0] : round[0][1]);
};

const createEndedTournamentElement = (tournament: any): HTMLElement => 
{
    const matchDiv = document.createElement('div');
    matchDiv.className = 'bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200';

    const matchHeader = document.createElement('div');
    matchHeader.className = 'flex justify-between items-center mb-1';

    const playerList = tournament.players.map((player: any) => player.name);
    const matchId = document.createElement('span');
    matchId.className = 'text-xs font-medium text-gray-500';
    matchId.textContent = `${locale.tournamentCreated} ${tournament.createdBy}`;
    
    matchHeader.appendChild(matchId);
    matchDiv.appendChild(matchHeader);

    // Conteneur des joueurs en attente -----------------
    const playersContainer = document.createElement('div');
    playersContainer.className = 'flex flex-col space-y-1';

    // 1 element pour chaque joueur
    playerList.forEach((playerName: string) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'text-xs font-medium text-gray-700';
        playerElement.textContent = ` ${playerName} ` ;
        playersContainer.appendChild(playerElement);
    });    
    
    // Rechercher le gagnant du tournoi ------------------
    for (const round of tournament.rounds) 
    {
        const winner = winnerName(round);
        if (winner) 
    {
            const name = winner.name;
            const winnerElement = document.createElement('div');
            winnerElement.className = 'text-sm font-bold text-green-600';
            winnerElement.textContent = `${locale.tournamentWinner} ${name}`;
            playersContainer.appendChild(winnerElement);
        }
    }

    // Bouton de détail ------------------------------------
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'w-40 mt-2 px-2 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
    detailsBtn.textContent = locale.viewOnBlockchain;
    detailsBtn.onclick = () => {
        if (tournament.hash)
            window.open(`https://subnets-test.avax.network/c-chain/tx/${tournament.hash}`, '_blank');
        else
            modalMessage(locale.Sorry, locale.blockchain_msg);
    };

    matchDiv.appendChild(playersContainer);
    matchDiv.appendChild(detailsBtn);

    return matchDiv;
};


const createOpenTournamentElement = (tournament: any): HTMLElement => 
{
const matchDiv = document.createElement('div');
matchDiv.className = 'bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200';

const matchHeader = document.createElement('div');
matchHeader.className = 'flex justify-between items-center mb-1';

const playerList = tournament.players.map((player: any) => player.name);
console.log('createOpenTournamentElement -> playerList', playerList);
const matchId = document.createElement('span');
matchId.className = 'text-xs font-medium text-gray-500';
matchId.textContent = `Tournament created by ${tournament.createdBy}`;

matchHeader.appendChild(matchId);
matchDiv.appendChild(matchHeader);

// Créer un conteneur pour les joueurs
const playersContainer = document.createElement('div');
playersContainer.className = 'flex flex-col space-y-1';

// Créer un élément pour chaque joueur
playerList.forEach((playerName: string) => {
    const playerElement = document.createElement('div');
    playerElement.className = 'text-xs font-medium text-gray-700';
    playerElement.textContent = ` ${playerName} is waiting ...` ;
    playersContainer.appendChild(playerElement);
});
matchDiv.appendChild(playersContainer);

return matchDiv;
};


export const createOpenTournamentCard = (title: string, tournaments: any[], emptyMessage: string): HTMLElement => {
    return createCard({
        title,
        items: tournaments,
        emptyMessage,
        itemRenderer: createOpenTournamentElement
    });
};

export const createEndedTournamentCard = (title: string, tournaments: any[], emptyMessage: string): HTMLElement => {
    return createCard({
        title,
        items: tournaments,
        emptyMessage,
        itemRenderer: createEndedTournamentElement
    });
};