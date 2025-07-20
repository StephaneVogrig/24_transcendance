import { navigate } from '../router';

// import { bottomBtn } from './components/bottomBtn';
// import { locale } from '../i18n';

import { 
    getTournamentsType,
    // subscribeToMatchUpdates,
    Match 
} from '../services/matchService';



// definir maxScore pour la logique de fin de match
const maxScore = 15; // Exemple de score maximum pour terminer un match


    const extractMatchesFromTournament = (tournament: any[], state: string, Matchs: Match[], playerNbr: number) => {
        let i = 0;
        let j = 0;
        let roundNbr = playerNbr / 2;
        for (const element of tournament) {
            // console.log('///////// ELEMENT DES TOURNOIS EN COURS :', element);
            // console.log('///////// ROUNDS TERMINES:', element.rounds);
            // convertir les round en Match
            for (const roundElement of element.rounds) {
                console.log('///////// ROUND:', roundElement);
                for (i = 0; i < roundElement.length; i++) {
                let match;
                let round = roundElement[i];
                match = {
                    id: `match-${i}`,
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
                console.log('///////// MATCH:', match);
                Matchs.push(match);
                }
                console.log('/////////  j = ', j);

                if ( j === roundNbr ) {
                    let match;
                    match = {
                        id: `match-${i}`,
                        player1: `?`,
                        player2: '?',
                        status: 'waiting',
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


    // const createEndedTournamentElement = (match: Match): HTMLElement =>{
    //     const matchDiv = document.createElement('div');
    //     matchDiv.className = 'bg-gray-100 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200';

    //     // Header du match
    //     const matchHeader = document.createElement('div');
    //     matchHeader.className = 'flex justify-between items-center mb-4';
        
    //     const matchIdSpan = document.createElement('span');
    //     matchIdSpan.className = 'text-sm font-medium text-gray-500';
    //     matchIdSpan.textContent = `Match #${match.id}`;
        
    //     const statusSpan = document.createElement('span');
    //     statusSpan.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600';
    //     statusSpan.textContent = 'Terminé';
        
    //     matchHeader.appendChild(matchIdSpan);
    //     matchHeader.appendChild(statusSpan);
    //     matchDiv.appendChild(matchHeader);
    //     return matchDiv;

    // }

    const getStatusInfo = (status: string) => {
        switch (status) {
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


  // const createMatchElement = (match: Match): HTMLElement => {
    const createCompactMatchElement = (match: Match): HTMLElement => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-gray-400 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200';

        const matchHeader = document.createElement('div');
        matchHeader.className = 'flex justify-between items-center mb-2';
        
        const matchId = document.createElement('span');
        matchId.className = 'text-xs font-medium text-gray-500';
        matchId.textContent = `Match #${match.id}`;
        
        const statusSpan = document.createElement('span');
        const statusInfo = getStatusInfo(match.status);
        statusSpan.className = `px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`;
        statusSpan.textContent = statusInfo.text;
        
        matchHeader.appendChild(matchId);
        matchHeader.appendChild(statusSpan);
        matchDiv.appendChild(matchHeader);

        const playersDiv = document.createElement('div');
        playersDiv.className = 'flex items-center justify-around text-sm';
        
        const player1Wrapper = document.createElement('div');
        player1Wrapper.className = 'bg-blue-100 text-blue-600 rounded-full px-3 py-1 font-bold';
        player1Wrapper.textContent = match.player1;
        
        const vs = document.createElement('span');
        vs.className = 'text-gray-40 font-bold';
        vs.textContent = 'VS';
        
        const player2Wrapper = document.createElement('div');
        player2Wrapper.className = 'bg-green-100 text-green-600 rounded-full px-3 py-1 font-bold';
        player2Wrapper.textContent = match.player2;
        
        playersDiv.appendChild(player1Wrapper);
        playersDiv.appendChild(vs);
        playersDiv.appendChild(player2Wrapper);
        matchDiv.appendChild(playersDiv);

        if (match.score && ( match.status === 'finished')) {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'flex justify-center mt-2 text-lg font';
            scoreDiv.innerHTML = `
                <span class="text-blue-600">${match.score.player1}</span>
                <span class="mx-2 text-gray-40">-</span>
                <span class="text-red-600">${match.score.player2}</span>
            `;
            matchDiv.appendChild(scoreDiv);
        }

        // Bouton de détails
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'w-full mt-3 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
        detailsBtn.textContent = 'Détails';
        detailsBtn.onclick = () => {
            alert(`Détails du match:\n\nID: ${match.id}\nJoueur 1: ${match.player1}${match.score ? ` - Score: ${match.score.player1}` : ''}\nJoueur 2: ${match.player2}${match.score ? ` - Score: ${match.score.player2}` : ''}\nStatut: ${getStatusInfo(match.status).text}`);
        };
        matchDiv.appendChild(detailsBtn);

        return matchDiv;
    };
    
    // const createElement = (match: Match): HTMLElement => {
    //     const matchDiv = document.createElement('div');
    //     matchDiv.className = 'bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200';

    //     const matchHeader = document.createElement('div');
    //     matchHeader.className = 'flex justify-between items-center mb-2';
        
    //     const matchId = document.createElement('span');
    //     matchId.className = 'text-xs font-medium text-gray-500';
    //     matchId.textContent = `Match #${match.id}`;
        
    //     const statusSpan = document.createElement('span');
    //     const statusInfo = getStatusInfo(match.status);
    //     statusSpan.className = `px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`;
    //     statusSpan.textContent = statusInfo.text;
        
    //     matchHeader.appendChild(matchId);
    //     matchHeader.appendChild(statusSpan);
    //     matchDiv.appendChild(matchHeader);

    //     const playersDiv = document.createElement('div');
    //     playersDiv.className = 'flex items-center justify-between text-sm';
        
    //     const player1 = document.createElement('span');
    //     player1.className = 'font-medium text-blue-600';
    //     player1.textContent = match.player1;
        
    //     const vs = document.createElement('span');
    //     vs.className = 'text-gray-400 font-bold';
    //     vs.textContent = 'VS';
        
    //     const player2 = document.createElement('span');
    //     player2.className = 'font-medium text-red-600';
    //     player2.textContent = match.player2;
        
    //     playersDiv.appendChild(player1);
    //     playersDiv.appendChild(vs);
    //     playersDiv.appendChild(player2);
    //     matchDiv.appendChild(playersDiv);

    //     if (match.score && (match.status === 'playing' || match.status === 'finished')) {
    //         const scoreDiv = document.createElement('div');
    //         scoreDiv.className = 'flex justify-center mt-2 text-lg font-bold';
    //         scoreDiv.innerHTML = `
    //             <span class="text-blue-600">${match.score.player1}</span>
    //             <span class="mx-2 text-gray-400">-</span>
    //             <span class="text-red-600">${match.score.player2}</span>
    //         `;
    //         matchDiv.appendChild(scoreDiv);
    //     }

    //     // Bouton de détails
    //     const detailsBtn = document.createElement('button');
    //     detailsBtn.className = 'w-full mt-3 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
    //     detailsBtn.textContent = 'Détails';
    //     detailsBtn.onclick = () => {
    //         alert(`Détails du match:\n\nID: ${match.id}\nJoueur 1: ${match.player1}${match.score ? ` - Score: ${match.score.player1}` : ''}\nJoueur 2: ${match.player2}${match.score ? ` - Score: ${match.score.player2}` : ''}\nStatut: ${getStatusInfo(match.status).text}`);
    //     };
    //     matchDiv.appendChild(detailsBtn);

    //     return matchDiv;
    // };
    
     // const createMatchElement = (match: Match): HTMLElement => {
    const createEndedTournamentElement = (match: Match): HTMLElement => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200';

        const matchHeader = document.createElement('div');
        matchHeader.className = 'flex justify-between items-center mb-2';
        
        const matchId = document.createElement('span');
        matchId.className = 'text-xs font-medium text-gray-500';
        matchId.textContent = `Match #${match.id}`;
        
        const statusSpan = document.createElement('span');
        const statusInfo = getStatusInfo(match.status);
        statusSpan.className = `px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`;
        statusSpan.textContent = statusInfo.text;
        
        matchHeader.appendChild(matchId);
        matchHeader.appendChild(statusSpan);
        matchDiv.appendChild(matchHeader);

        const playersDiv = document.createElement('div');
        playersDiv.className = 'flex items-center justify-between text-sm';
        
        const player1 = document.createElement('span');
        player1.className = 'font-medium text-blue-600';
        player1.textContent = match.player1;
        
        const vs = document.createElement('span');
        vs.className = 'text-gray-400 font-bold';
        vs.textContent = 'VS';
        
        const player2 = document.createElement('span');
        player2.className = 'font-medium text-red-600';
        player2.textContent = match.player2;
        
        playersDiv.appendChild(player1);
        playersDiv.appendChild(vs);
        playersDiv.appendChild(player2);
        matchDiv.appendChild(playersDiv);

        if (match.score && (match.status === 'playing' || match.status === 'finished')) {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'flex justify-center mt-2 text-lg font-bold';
            scoreDiv.innerHTML = `
                <span class="text-blue-600">${match.score.player1}</span>
                <span class="mx-2 text-gray-400">-</span>
                <span class="text-red-600">${match.score.player2}</span>
            `;
            matchDiv.appendChild(scoreDiv);
        }

        // Bouton de détails
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'w-full mt-3 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
        detailsBtn.textContent = 'Détails';
        detailsBtn.onclick = () => {
            alert(`Détails du match:\n\nID: ${match.id}\nJoueur 1: ${match.player1}${match.score ? ` - Score: ${match.score.player1}` : ''}\nJoueur 2: ${match.player2}${match.score ? ` - Score: ${match.score.player2}` : ''}\nStatut: ${getStatusInfo(match.status).text}`);
        };
        matchDiv.appendChild(detailsBtn);

        return matchDiv;
    };

        const createOpenTournamentCard = (title: string, matches: Match[], statusColor: string, emptyMessage: string): HTMLElement => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-6';

        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-4 pb-3 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-xl font-bold text-gray-800';
        cardTitle.textContent = title;
        
        //petite bulle d'info sur le nombre de matchs
        // const matchCount = document.createElement('span');
        // matchCount.className = `px-3 py-1 rounded-full text-sm font-medium ${statusColor}`;
        // matchCount.textContent = `${matches.length} match${matches.length > 1 ? 's' : ''}`;
        
        cardHeader.appendChild(cardTitle);
        // cardHeader.appendChild(matchCount);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-3 max-h-96 overflow-y-auto';

        if (matches.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-8 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-4xl mb-2">🎮</div>
                <p>${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);
        } else {
            matches.forEach(match => {
                const matchItem = createOpenTournamentElement(match);
                matchList.appendChild(matchItem);
            });
        }

        card.appendChild(matchList);
        return card;
    };


    const createOpenTournamentElement = (match: Match): HTMLElement => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200';

        const matchHeader = document.createElement('div');
        matchHeader.className = 'flex justify-between items-center mb-2';
        
        const matchId = document.createElement('span');
        matchId.className = 'text-xs font-medium text-gray-500';
        matchId.textContent = `Match #${match.id}`;
        
        const statusSpan = document.createElement('span');
        const statusInfo = getStatusInfo(match.status);
        statusSpan.className = `px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`;
        statusSpan.textContent = statusInfo.text;
        
        matchHeader.appendChild(matchId);
        matchHeader.appendChild(statusSpan);
        matchDiv.appendChild(matchHeader);

        const playersDiv = document.createElement('div');
        playersDiv.className = 'flex items-center justify-between text-sm';
        
        const player1 = document.createElement('span');
        player1.className = 'font-medium text-blue-600';
        player1.textContent = match.player1;
        
        const vs = document.createElement('span');
        vs.className = 'text-gray-400 font-bold';
        vs.textContent = 'VS';
        
        const player2 = document.createElement('span');
        player2.className = 'font-medium text-red-600';
        player2.textContent = match.player2;
        
        playersDiv.appendChild(player1);
        playersDiv.appendChild(vs);
        playersDiv.appendChild(player2);
        matchDiv.appendChild(playersDiv);

        if (match.score && (match.status === 'playing' || match.status === 'finished')) {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'flex justify-center mt-2 text-lg font-bold';
            scoreDiv.innerHTML = `
                <span class="text-blue-600">${match.score.player1}</span>
                <span class="mx-2 text-gray-400">-</span>
                <span class="text-red-600">${match.score.player2}</span>
            `;
            matchDiv.appendChild(scoreDiv);
        }

        // Bouton de détails
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'w-full mt-3 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200';
        detailsBtn.textContent = 'Détails';
        detailsBtn.onclick = () => {
            alert(`Détails du match:\n\nID: ${match.id}\nJoueur 1: ${match.player1}${match.score ? ` - Score: ${match.score.player1}` : ''}\nJoueur 2: ${match.player2}${match.score ? ` - Score: ${match.score.player2}` : ''}\nStatut: ${getStatusInfo(match.status).text}`);
        };
        matchDiv.appendChild(detailsBtn);

        return matchDiv;
    };

        const createEndedTournamentCard = (title: string, matches: Match[], statusColor: string, emptyMessage: string): HTMLElement => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-6';

        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-4 pb-3 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-xl font-bold text-gray-800';
        cardTitle.textContent = title;
        
        //petite bulle d'info sur le nombre de matchs
        // const matchCount = document.createElement('span');
        // matchCount.className = `px-3 py-1 rounded-full text-sm font-medium ${statusColor}`;
        // matchCount.textContent = `${matches.length} match${matches.length > 1 ? 's' : ''}`;
        
        cardHeader.appendChild(cardTitle);
        // cardHeader.appendChild(matchCount);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-3 max-h-96 overflow-y-auto';

        if (matches.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-8 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-4xl mb-2">🎮</div>
                <p>${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);
        } else {
            matches.forEach(match => {
                const matchItem = createEndedTournamentElement(match);
                matchList.appendChild(matchItem);
            });
        }

        card.appendChild(matchList);
        return card;
    };

    const createTournamentCard = (title: string, matches: Match[], statusColor: string, emptyMessage: string): HTMLElement => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-6';

        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-4 pb-3 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-xl font-bold text-gray-800';
        cardTitle.textContent = title;
        
        //petite bulle d'info sur le nombre de matchs
        // const matchCount = document.createElement('span');
        // matchCount.className = `px-3 py-1 rounded-full text-sm font-medium ${statusColor}`;
        // matchCount.textContent = `${matches.length} match${matches.length > 1 ? 's' : ''}`;
        
        cardHeader.appendChild(cardTitle);
        // cardHeader.appendChild(matchCount);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-3 max-h-96 overflow-y-auto';

        if (matches.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-8 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-4xl mb-2">🎮</div>
                <p>${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);}
        else {
            console.log('createTournamentCard -> MATCHS récupérés  ', matches);
            matches.forEach(match => {
                const matchItem = createCompactMatchElement(match);
                matchList.appendChild(matchItem);
            });
        }

        card.appendChild(matchList);
        return card;
    };

    const createOngoingTournamentCard = (title: string, matches: Match[], statusColor: string, emptyMessage: string): HTMLElement => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg p-6 min-h-[600px]';

        // Header de la carte
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex items-center justify-between mb-4 pb-3 border-b';
        
        const cardTitle = document.createElement('h2');
        cardTitle.className = 'text-xl font-bold text-gray-800';
        cardTitle.textContent = title;
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);

        // Conteneur des matchs
        const matchList = document.createElement('div');
        matchList.className = 'space-y-3 max-h-[500px] overflow-y-auto';

        if (matches.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center py-8 text-gray-500';
            emptyDiv.innerHTML = `
                <div class="text-4xl mb-2">🎮</div>
                <p>${emptyMessage}</p>
            `;
            matchList.appendChild(emptyDiv);}
        else {
            console.log('createOngoingTournamentCard -> MATCHS récupérés  ', matches);
            matches.forEach(match => {
                const matchItem = createCompactMatchElement(match);
                matchList.appendChild(matchItem);
            });
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

            // Convertir les tournois en matchs
            const Matchs_tournament_ended: Match[] = [];
            extractMatchesFromTournament(ended, 'finished', Matchs_tournament_ended, 4);
            
            const Matchs_tournament_open: Match[] = [];
            extractMatchesFromTournament(open, 'waiting', Matchs_tournament_open, 4);
            
            const Matchs_tournament_ongoing: Match[] = [];
            extractMatchesFromTournament(ongoing, 'playing', Matchs_tournament_ongoing, 4);


            // DEBUG ------------
            if (open.length != 0 ) {
                console.log('+++ open TOURNAMENT récupérés +++ ', open);
                console.log('+++ LISTE DES MATCHS ouverts récupérés +++ ', Matchs_tournament_open);

            }
            if (ongoing.length != 0) { 
                console.log('??? ongoing TOURNAMENT récupérés ??? ', ongoing);
                console.log('*** LISTE DES MATCHS en cours récupérés *** ', Matchs_tournament_ongoing);

            }
            if (ended.length != 0) {   
                console.log('*** ended TOURNAMENT récupérés *** ', ended);
                console.log('=== LISTE DES MATCHS terminés récupérés === ', Matchs_tournament_ended);
            }

            // Vider le conteneur et créer les cartes
            cardsContainer.innerHTML = '';

            // Créer les 3 cartes
            const waitingCard = createOpenTournamentCard('Tournois en Attente', Matchs_tournament_open,
                'bg-yellow-100 text-yellow-800','Aucun tournoi en attente');

            const ongoingCard = createOngoingTournamentCard('Tournois en Cours', Matchs_tournament_ongoing,
                'bg-green-100 text-green-800', 'Aucun tournoi en cours');

            const finishedCard = createEndedTournamentCard('Tournois Terminés', Matchs_tournament_ended,
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
export const TestPage = (): HTMLElement => {
    // Conteneur principal (remplace mainDiv)
    const container = document.createElement('div');
    container.className = 'max-w-none mx-auto min-h-screen p-6';
    // container.className = 'max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6';

    // Titre de la page
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center justify-between mb-8';

    // Bouton retour
    const backButton = document.createElement('button');
    backButton.className = 'flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200';
    backButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Retour</span>
    `;
    backButton.onclick = () => navigate('/choice-game');

    const title = document.createElement('h1');
    title.className = 'text-4xl font-bold text-Blue-800 flex-1 text-center';
    title.textContent = 'Matchs';

    // Espace pour équilibrer
    const spacer = document.createElement('div');
    spacer.className = 'w-20';

    titleContainer.appendChild(backButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(spacer);
    container.appendChild(titleContainer);

    // Conteneur des cartes de tournois
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'space-y-6 mb-8';
    container.appendChild(cardsContainer);

    // Charger les matchs au chargement de la page
    loadMatches(cardsContainer);

    // Bouton de rafraîchissement
    const refreshButton = document.createElement('button');
    refreshButton.className = 'fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-10';
    refreshButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
    `;
    refreshButton.title = 'Rafraîchir les matchs';
    refreshButton.onclick = () => {
        console.log('Rafraîchissement des matchs...');
        loadMatches(cardsContainer);
    };
    container.appendChild(refreshButton);

    // Variables pour gérer les mises à jour
    let unsubscribeFromUpdates: (() => void) | null = null;

    // Fonction pour démarrer les mises à jour en temps réel

    // Nettoyer lors de la destruction de la page
    const cleanup = () => {
        if (unsubscribeFromUpdates) {
            unsubscribeFromUpdates();
            unsubscribeFromUpdates = null;
        }
    };

    // Ajouter l'événement pour nettoyer lors de la navigation
    window.addEventListener('beforeunload', cleanup);
    
    // Nettoyer si l'utilisateur change de page
    const observer = new MutationObserver(() => {
        if (!document.contains(container)) {
            cleanup();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Charger les matchs au démarrage
    loadMatches(cardsContainer);
    
    // Démarrer les mises à jour en temps réel
    // startRealTimeUpdates();

    return container;
};

