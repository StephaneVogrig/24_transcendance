import { locale } from '../i18n';
import { bottomBtn } from './components/bottomBtn';
import { getTournamentsType } from './MatchDisplayUtils/matchDisplayUtils';
import { createOngoingTournamentCard } from './MatchDisplayUtils/matchDisplayOnGoing';
import { createOpenTournamentCard, createEndedTournamentCard } from './MatchDisplayUtils/matchDisplayEndedAndOpen';

const errorInfo = (cardsContainer: HTMLElement,  msg1: string, msg2: string): void => 
{
    cardsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-semibold text-red-600 mb-2"> ${msg1}</h3>
                    <p class="text-gray-500"> ${msg2} </p>
                </div>
            `;
}

const loadMatches = async (cardsContainer : HTMLElement ) => 
{
    try {
        //  indicateur de chargement
        cardsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-gray-600">${locale.matchDownload}</p>
            </div>
        `;

        // Récupérer les matchs depuis le service
        const open = await getTournamentsType('open');
        const ongoing = await getTournamentsType('ongoing');
        const ended = await getTournamentsType('ended');

        // DEBUG ------------
        if (open.length != 0 )
            console.log('+++ open TOURNAMENT récupérés +++ ', open);
        if (ongoing.length != 0) 
            console.log('??? ongoing TOURNAMENT récupérés ??? ', ongoing);
        if (ended.length != 0)   
            console.log('*** ended TOURNAMENT récupérés *** ', ended);

        // Vider le conteneur et créer les cartes
        cardsContainer.innerHTML = '';

        // Créer les cartes pour chaque type de tournoi
        const waitingCard = createOpenTournamentCard(locale.tournamentWaiting, open, locale.noTournamentWaiting);

        const ongoingCard = createOngoingTournamentCard(locale.tournamentInProgress, ongoing,
            'bg-green-100 text-green-800', locale.noTournamentInProgress);

        const finishedCard = createEndedTournamentCard(locale.tournamentFinished, ended, locale.noTournamentFinished);

        // Ajouter la carte ongoing au-dessus
        cardsContainer.appendChild(ongoingCard);

        // Créer un conteneur pour les deux cartes du bas
        const bottomCardsContainer = document.createElement('div');
        bottomCardsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full';
        
        // Ajouter les cartes waiting et finished côte à côte
        bottomCardsContainer.appendChild(waitingCard);
        bottomCardsContainer.appendChild(finishedCard);
        
        cardsContainer.appendChild(bottomCardsContainer);
    } 
    catch (error) {
        errorInfo(cardsContainer, locale.errorMatchDownload, locale.errorMatchDisplay);
    }
};

export const MatchDisplayPage = (): HTMLElement => 
{
    // Conteneur principal (remplace mainDiv)
    const container = document.createElement('div');
    container.className = 'mx-auto max-w-7xl h-full grid grid-rows-[auto_1fr_auto]';

    // Titre de la page
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center justify-between';

    const leftSpacer = document.createElement('div');
    leftSpacer.className = 'w-10';
    titleContainer.appendChild(leftSpacer);

    const title = document.createElement('h1');
    title.className = 'text-center text-3xl font-extrabold text-blue-400 mb-4';
    title.textContent = locale.matchTitle;
    titleContainer.appendChild(title);
    container.appendChild(titleContainer);

    //Bouton de rafraîchissement
    const refreshButton = document.createElement('button');
    refreshButton.className = 'bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-10';
    refreshButton.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
    `;
    refreshButton.onclick = () => {
        loadMatches(cardsContainer);
    };
    titleContainer.appendChild(refreshButton);

    // Conteneur des cartes de tournois
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'space-y-3 pb-12';
    loadMatches(cardsContainer);
    container.appendChild(cardsContainer);

    container.appendChild(bottomBtn(locale.back_home, '/'));
    
    return container;
};

