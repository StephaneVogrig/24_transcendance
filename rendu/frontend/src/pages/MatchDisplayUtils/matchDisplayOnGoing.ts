
import { locale } from '../../i18n';
import { Match } from './matchDisplayUtils';
import { createCard } from './matchDisplayCards';

const maxScore = 5;

const initMatch = (match: any, round: any[] | null, state: string, type: string) =>
{
    if (round === null)
    {
         match = {
            id: locale.finalMatch,
            player1: '?',
            player2: '?',
            status: 'final_waiting',
            score: { player1: 0,  player2: 0 }
        };
    }
    else if (round && round.length > 0)
    {    
        match = {
        id: type,
        player1: round[0].name,
        player2: round[1].name,
        score: { player1: round[0].score, player2: round[1].score},
        status: (round[0].score === maxScore || round[1].score === maxScore) ? 'finished' : state
        };
    }    
    return(match);
}

export const createOngoingMatchCard = (title: string, matches: Match[]): HTMLElement => {
    return createCard({
        title,
        items: matches,
        emptyMessage: locale.noTournamentInProgress,
        itemRenderer: createMatchElement,
        className: 'bg-white rounded-lg shadow-lg p-2 min-h-[200px]'
    });
};

// Transforme un tournoi en cours en carte de matchs
const tournamentToMatchCard = (tournament: any): HTMLElement => {
    const matches: Match[] = [];
    extractMatchesFromTournament([tournament], 'playing', matches, 4);
    const tournamentName = tournament.createdBy;
    return createOngoingMatchCard(`${locale.tournamentName} ${tournamentName}`, matches);
};

export const createOngoingTournamentCard = (title: string, tournaments: any[], statusColor: string, emptyMessage: string): HTMLElement => {
    void statusColor; // Paramètre inutilisé
    return createCard({
        title,
        items: tournaments,
        emptyMessage,
        itemRenderer: tournamentToMatchCard,
        className: 'bg-white rounded-lg shadow-lg p-2 min-h-[400px]'
    });
};


const extractMatchesFromTournament = (tournament: any[], state: string, Matchs: Match[], playerNbr: number) => {
    let i = 1;
    let roundNbr = playerNbr / 2;

    for (const element of tournament)
    {
        for (const roundElement of element.rounds) 
        {
            let match;
            if (roundElement.length === 1) // c'est la finale
            {
                let round = roundElement[0];
                match = initMatch(match, round, state, locale.finalMatch);
                Matchs.push(match);
                return;
            }
            else
            {
                for (i = 0; i < roundElement.length; i++) // les match existants [plyr1 VS plyr2]
                {
                    let round = roundElement[i];
                    match = initMatch(match, round, state, `Match ${i + 1}`);
                    Matchs.push(match);
                }
                if ( i === 2 && element.rounds.length != roundNbr) // pour la finale [ ? VS ? ]
                {
                    match = initMatch(match, null, state, 'final_waiting');
                    Matchs.push(match);
                }
            }   
        }
    }
};

const getStatusInfo = (status: string) => {
        switch (status) {

            case 'final_waiting':
                return { color: 'bg-orange-100 text-orange-800', text: locale.matchWaiting };
            case 'waiting':
                return { color: 'bg-yellow-100 text-yellow-800', text: locale.matchWaiting };
            case 'playing':
                return { color: 'bg-green-100 text-green-800', text: locale.matchPlaying };
            case 'finished':
                return { color: 'bg-gray-100 text-gray-800', text: locale.matchFinished };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        }
};

const createMatchElement = (match: Match): HTMLElement => 
{
    const matchDiv = document.createElement('div');
    matchDiv.className = 'bg-gray-400 rounded-lg p-2 flex items-center space-x-2';

    // Conteneur gauche ---------[ Match id + status ]----------------------------  
    const leftContainer = document.createElement('div');
    leftContainer.className = 'flex flex-col items-start space-y-1 min-w-[80px]';

    // -> Match id 
    const matchId = document.createElement('span');
    matchId.className = 'text-xs font-bold text-gray-800';
    matchId.textContent = match.id;

    // -> statut  
    const statusSpan = document.createElement('span');
    const statusInfo = getStatusInfo(match.status);
    statusSpan.className = `px-1 py-0.5 rounded text-xs font-medium ${statusInfo.color}`;
    statusSpan.textContent = statusInfo.text;
    
    leftContainer.appendChild(matchId);
    leftContainer.appendChild(statusSpan);

    // Conteneur droit ----------[player1 VS player2] + [scores] --------------------
    const rightContainer = document.createElement('div');
    rightContainer.className = 'flex-1';

    const playersDiv = document.createElement('div');
    playersDiv.className = 'flex items-center justify-around text-xs';
    
    // -> player1 
    const player1Wrapper = document.createElement('div');
    player1Wrapper.className = 'bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-bold';
    player1Wrapper.textContent = match.player1;
    
    // -> VS
    const vs = document.createElement('span');
    vs.className = 'text-white font-bold text-xs';
    vs.textContent = 'VS';
    
    // -> player2
    const player2Wrapper = document.createElement('div');
    player2Wrapper.className = 'bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-bold';
    player2Wrapper.textContent = match.player2;
    
    playersDiv.appendChild(player1Wrapper);
    playersDiv.appendChild(vs);
    playersDiv.appendChild(player2Wrapper);
    rightContainer.appendChild(playersDiv);

    // ->  score si match terminé
    if (match.score && ( match.status === 'finished')) {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'flex justify-center mt-1 text-sm font';
        scoreDiv.innerHTML = `
            <span class="text-blue-600">${match.score.player1}</span>
            <span class="mx-1 text-gray-40">-</span>
            <span class="text-blue-600">${match.score.player2}</span>
        `;
        rightContainer.appendChild(scoreDiv);
    }

    matchDiv.appendChild(leftContainer);
    matchDiv.appendChild(rightContainer);
    
    return matchDiv;
};