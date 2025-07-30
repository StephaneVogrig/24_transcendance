import { navigate } from '../router';
// import { locale } from '../i18n';

import { 
    getTournamentsType,
    Match
} from '../services/matchService';

const maxScore = 5; 

    const extractMatchesFromTournament = (tournament: any[], state: string, Matchs: Match[], playerNbr: number) => {
        let i = 1;
        let j = 0;
        let roundNbr = playerNbr / 2;

        for (const element of tournament) {
            // convertir les round en Match
            for (const roundElement of element.rounds) {
                // console.log('///////// ROUND:', roundElement);
                for (i = 0; i < roundElement.length; i++) {
                let match;
                let round = roundElement[i];
                match = {
                    id: `Match ${i}`,
                    player1: round[0].name,
                    player2: round[1].name,
                    // status: state,
                    score: {
                        player1: round[0].score,
                        player2: round[1].score
                    },
                    status: (round[0].score === maxScore || round[1].score === maxScore) ? 'finished' : state
                };
                j++;
                // console.log('///////// MATCH:', match);
                Matchs.push(match);
                }
                // console.log('///////// element.rounds.length ', element.rounds.length );
                if ( i === 2 && element.rounds.length != roundNbr) {
                    let match;
                    match = {
                        id: `Match ${i}`,
                        player1: `?`,
                        player2: '?',
                        status: 'final_waiting',
                        score: {
                            player1: 0,
                            player2: 0
                        }
                    };
                    console.log('///////// MATCH:', match);
                    Matchs.push(match);
                }
            }
        }
    };


    const getStatusInfo = (status: string) => {
        switch (status) {
            // case 'finale':
            //     return { color: 'bg-pink-100 text-orange-800', text: 'Finale playing' };
            case 'final_waiting':
                return { color: 'bg-orange-100 text-orange-800', text: 'Finale en attente' };
            case 'waiting':
                return { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' };
            case 'playing':
                return { color: 'bg-green-100 text-green-800', text: 'En cours' };
            case 'finished':
                return { color: 'bg-gray-100 text-gray-800', text: 'Terminé' };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
        }
    };



    const createMatchElement = (match: Match): HTMLElement => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-gray-400 rounded-lg p-2 flex items-center space-x-2';

        // Conteneur gauche pour le numéro et le statut
        const leftContainer = document.createElement('div');
        leftContainer.className = 'flex flex-col items-start space-y-1 min-w-[80px]';
        
        const matchId = document.createElement('span');
        matchId.className = 'text-xs font-bold text-gray-800';
        matchId.textContent = match.id;
        
        const statusSpan = document.createElement('span');
        const statusInfo = getStatusInfo(match.status);
        statusSpan.className = `px-1 py-0.5 rounded text-xs font-medium ${statusInfo.color}`;
        statusSpan.textContent = statusInfo.text;
        
        leftContainer.appendChild(matchId);
        leftContainer.appendChild(statusSpan);

        // Conteneur droit pour les joueurs et le score
        const rightContainer = document.createElement('div');
        rightContainer.className = 'flex-1';

        const playersDiv = document.createElement('div');
        playersDiv.className = 'flex items-center justify-around text-xs';
        
        const player1Wrapper = document.createElement('div');
        player1Wrapper.className = 'bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-bold';
        player1Wrapper.textContent = match.player1;
        
        const vs = document.createElement('span');
        vs.className = 'text-white font-bold text-xs';
        vs.textContent = 'VS';
        
        const player2Wrapper = document.createElement('div');
        player2Wrapper.className = 'bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-bold';
        player2Wrapper.textContent = match.player2;
        
        playersDiv.appendChild(player1Wrapper);
        playersDiv.appendChild(vs);
        playersDiv.appendChild(player2Wrapper);
        rightContainer.appendChild(playersDiv);

        if (match.score && ( match.status === 'finished')) {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'flex justify-center mt-1 text-sm font';
            scoreDiv.innerHTML = `
                <span class="text-blue-600">${match.score.player1}</span>
                <span class="mx-1 text-gray-40">-</span>
                <span class="text-red-600">${match.score.player2}</span>
            `;
            rightContainer.appendChild(scoreDiv);
        }

        matchDiv.appendChild(leftContainer);
        matchDiv.appendChild(rightContainer);
        
        return matchDiv;
    };

        const winnerName = (round: any) =>
        {
        	if (round.length > 1)
            {
                console.log(`No winners yet for tournament ID .`);
                return null;
            }
            else
                return( round[0][0].score > round[0][1].score ? round[0][0] : round[0][1]);
        };

        const createEndedTournamentElement = (tournament: any): HTMLElement => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200';

            const matchHeader = document.createElement('div');
            matchHeader.className = 'flex justify-between items-center mb-1';

            // const playerList = tournament.players.map((player: any) => player.name).join(' - ');
            const playerList = tournament.players.map((player: any) => player.name);
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
                playerElement.textContent = ` ${playerName} ` ;
                playersContainer.appendChild(playerElement);
            });    
            
            for (const round of tournament.rounds) {
                const winner = winnerName(round);
                if (winner) {
                    const name = winner.name;
                    const winnerElement = document.createElement('div');
                    winnerElement.className = 'text-sm font-bold text-green-600';
                    winnerElement.textContent = `🏆 Vainqueur: ${name}`;
                    playersContainer.appendChild(winnerElement);
                }
            }
            // Bouton de détails
            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'w-40 mt-2 px-2 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
            detailsBtn.textContent = 'View on Blockchain';
            detailsBtn.onclick = () => {
				if (tournament.hash)
					window.open(`https://subnets-test.avax.network/c-chain/tx/${tournament.hash}`, '_blank');
				else
					alert(`Results are still being registered to the blockchain! This process can take up to 10 seconds, try again soon.`);
            };

            matchDiv.appendChild(playersContainer);
            matchDiv.appendChild(detailsBtn);

            return matchDiv;
        };

        const createOpenTournamentCard = (title: string, tournament: any[], statusColor: string, emptyMessage: string): HTMLElement => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-3';

        void statusColor;
        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-2 pb-2 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-sm font-bold text-gray-800';
        cardTitle.textContent = title;
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);

        // Conteneur des tournois
        const tournamentList = document.createElement('div');
        tournamentList.className = 'space-y-2 max-h-60 overflow-y-auto';

        if (tournament.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-4 text-gray-500';
            emptyDiv.innerHTML = `
            <div class="text-2xl mb-1">🎮</div>
            <p class="text-xs">${emptyMessage}</p>
            `;
            tournamentList.appendChild(emptyDiv);
        } else {
            tournament.forEach(singleTournament => {
            const tournamentItem = createOpenTournamentElement(singleTournament);
            tournamentList.appendChild(tournamentItem);
            });
        }

        card.appendChild(tournamentList);
        return card;
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

    const createEndedTournamentCard = (title: string, tournament: any[], statusColor: string, emptyMessage: string): HTMLElement => 
    {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-3';

        void statusColor;
        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-2 pb-2 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-sm font-bold text-gray-800';
        cardTitle.textContent = title;
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);

        // Conteneur des tournois
        const tournamentList = document.createElement('div');
        tournamentList.className = 'space-y-2 max-h-60 overflow-y-auto';

        if (tournament.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-4 text-gray-500';
            emptyDiv.innerHTML = `
            <div class="text-2xl mb-1">🎮</div>
            <p class="text-xs">${emptyMessage}</p>
            `;
            tournamentList.appendChild(emptyDiv);
        } else {
            // tournament.forEach( singleTournament => {
            // const tournamentItem = createEndedTournamentElement(singleTournament);
            // tournamentList.appendChild(tournamentItem);
            // });
            // autre méthode pour parcourir le tableau
            for (const element of tournament) 
            {
                const tournamentItem = createEndedTournamentElement(element);
                tournamentList.appendChild(tournamentItem);
            }
        }
        card.appendChild(tournamentList);
        return card;
    };


    const createOngoingMatchCard = (title: string, matches: Match[], statusColor: string, emptyMessage: string): HTMLElement => 
    {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-2 min-h-[200px]';

        void statusColor;
        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-2 pb-1 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-sm font-bold text-gray-800';
        cardTitle.textContent = title;
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-1 max-h-[170px] overflow-y-auto';

        if (matches.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-3 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-xl mb-1">🎮</div>
                <p class="text-xs">${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);}
        else {
            console.log(' -> MATCHS récupérés  ', matches);
            matches.forEach(match => {
                const matchItem = createMatchElement(match);
                matchList.appendChild(matchItem);
            }); 
        }

        card.appendChild(matchList);
        return card;
    };

    const createOngoingTournamentCard = (title: string, tournaments: any[], statusColor: string, emptyMessage: string): HTMLElement => 
    {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-2 min-h-[400px]';

        void statusColor;
        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-2 pb-1 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-lg font-bold text-gray-800';
        cardTitle.textContent = title;
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-2 max-h-[360px] overflow-y-auto';
        // Vérifier si le tableau tournaments est vide
        console.log('createOngoingTournamentCard -> tournaments', tournaments);
        if (tournaments.length === 0) 
        {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-3 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-2xl mb-1">🎮</div>
                <p class="text-xs">${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);
        }
        else {
            for (let i = 0; i < tournaments.length; i++ )
            {
                const Matchs_tournament_ongoing: Match[] = [];
                extractMatchesFromTournament([tournaments[i]], 'playing', Matchs_tournament_ongoing, 4);
                console.log('createOngoingTournamentCard -> Matchs_tournament_ongoing', Matchs_tournament_ongoing);
                const tournamentsName: string = tournaments[i].createdBy;
                const ongoingCard = createOngoingMatchCard(`Tournoi de ${tournamentsName}`, Matchs_tournament_ongoing,
                'bg-green-100 text-green-800', 'Aucun tournoi en cours');
                matchList.appendChild(ongoingCard);
            }
        }

        card.appendChild(matchList);
        return card;
    };


    
    const loadMatches = async (cardsContainer : HTMLElement ) => {
        try {
            // Afficher un indicateur de chargement
            cardsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p class="text-gray-600">Chargement des matchs...</p>
                </div>
            `;

            // Récupérer les matchs depuis le service
            const open = await getTournamentsType('open');
            const ongoing = await getTournamentsType('ongoing');
            const ended = await getTournamentsType('ended');

            // const Matchs_tournament_ongoing: Match[] = [];
            // extractMatchesFromTournament(ongoing, 'playing', Matchs_tournament_ongoing, 4);


            // DEBUG ------------
            if (open.length != 0 ) {
                console.log('+++ open TOURNAMENT récupérés +++ ', open);
            }
            if (ongoing.length != 0) { 
                console.log('??? ongoing TOURNAMENT récupérés ??? ', ongoing);
                // console.log('*** LISTE DES MATCHS en cours récupérés *** ', Matchs_tournament_ongoing);
            }
            if (ended.length != 0) {   
                console.log('*** ended TOURNAMENT récupérés *** ', ended);
            }

            // Vider le conteneur et créer les cartes
            cardsContainer.innerHTML = '';

            // Créer les cartes pour chaque type de tournoi
            const waitingCard = createOpenTournamentCard('Tournois en Attente', open,
                'bg-yellow-100 text-yellow-800','Aucun tournoi en attente');

            // const ongoingCard = createOngoingTournamentCard('Tournois en Cours', Matchs_tournament_ongoing,
            //     'bg-green-100 text-green-800', 'Aucun tournoi en cours');

            const ongoingCard = createOngoingTournamentCard('Tournois en Cours', ongoing,
                'bg-green-100 text-green-800', 'Aucun tournoi en cours');

            const finishedCard = createEndedTournamentCard('Tournois Terminés', ended,
                'bg-gray-100 text-gray-800','Aucun tournoi terminé');

            // Ajouter la carte ongoing au-dessus
            cardsContainer.appendChild(ongoingCard);

            // Créer un conteneur pour les deux cartes du bas
            const bottomCardsContainer = document.createElement('div');
            bottomCardsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
            
            // Ajouter les cartes waiting et finished côte à côte
            bottomCardsContainer.appendChild(waitingCard);
            bottomCardsContainer.appendChild(finishedCard);
            
            cardsContainer.appendChild(bottomCardsContainer);

        } catch (error) {
            console.error('Erreur lors du chargement des matchs:', error);
            cardsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-semibold text-red-600 mb-2">Erreur de chargement</h3>
                    <p class="text-gray-500">Impossible de charger les matchs. Veuillez réessayer.</p>
                </div>
            `;
        }
    };

// Fonction pour créer la page de test
export const MatchDisplayPage = (): HTMLElement => {
    // Conteneur principal (remplace mainDiv)
    const container = document.createElement('div');
    container.className = 'max-w-none mx-auto min-h-screen p-3';

    // Titre de la page
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center justify-between mb-4';

    // Bouton retour
    const backButton = document.createElement('button');
    backButton.className = 'flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200';
    backButton.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span class="text-xs">Retour</span>
    `;
    backButton.onclick = () => navigate('/choice-game');

    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold text-Blue-800 flex-1 text-center';
    title.textContent = 'Matchs';

    // Espace pour équilibrer
    const spacer = document.createElement('div');
    spacer.className = 'w-16';

    titleContainer.appendChild(backButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(spacer);
    container.appendChild(titleContainer);

    // Conteneur des cartes de tournois
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'space-y-3 mb-4';
    container.appendChild(cardsContainer);

    // Charger les matchs au chargement de la page
    loadMatches(cardsContainer);

    //Bouton de rafraîchissement
    const refreshButton = document.createElement('button');
    refreshButton.className = 'bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-10';
    refreshButton.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
    `;
    refreshButton.title = 'Rafraîchir les matchs';
    refreshButton.onclick = () => {
        console.log('Rafraîchissement des matchs...');
        loadMatches(cardsContainer);
    };
    titleContainer.appendChild(refreshButton);

    // Variables pour gérer les mises à jour
    // let unsubscribeFromUpdates: (() => void) | null = null;

    // Fonction pour démarrer les mises à jour en temps réel

    // Nettoyer lors de la destruction de la page
    // const cleanup = () => {
    //     if (unsubscribeFromUpdates) {
    //         unsubscribeFromUpdates();
    //         unsubscribeFromUpdates = null;
    //     }
    // };

    // Ajouter l'événement pour nettoyer lors de la navigation
    // window.addEventListener('beforeunload', cleanup);
    
    // Nettoyer si l'utilisateur change de page
    // const observer = new MutationObserver(() => {
    //     if (!document.contains(container)) {
    //         cleanup();
    //         observer.disconnect();
    //     }
    // });
    // observer.observe(document.body, { childList: true, subtree: true });

    // Charger les matchs au démarrage
    loadMatches(cardsContainer);
    
    return container;
};

