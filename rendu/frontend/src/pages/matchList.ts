import { 
    getActiveMatches, 
    subscribeToMatchUpdates, 
    formatTimeElapsed, 
    getStatusColor, 
    getStatusText,
    Match 
} from '../services/matchService';
import { navigate } from '../router';

export const MatchListPage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6';

    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto';
    mainDiv.appendChild(container);

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
    title.className = 'text-4xl font-bold text-gray-800 flex-1 text-center';
    title.textContent = 'Matchs en Cours';

    // Espace pour équilibrer
    const spacer = document.createElement('div');
    spacer.className = 'w-20';

    titleContainer.appendChild(backButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(spacer);
    container.appendChild(titleContainer);

    // Conteneur des matchs
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'space-y-6';
    container.appendChild(matchesContainer);

    // Fonction pour créer un match
    const createMatchElement = (match: Match) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200';

        // Header du match
        const matchHeader = document.createElement('div');
        matchHeader.className = 'flex justify-between items-center mb-4';
        
        const matchIdSpan = document.createElement('span');
        matchIdSpan.className = 'text-sm font-medium text-gray-500';
        matchIdSpan.textContent = `Match #${match.id.split('_')[1] || 'N/A'}`;
        
        const matchTimeSpan = document.createElement('span');
        matchTimeSpan.className = 'text-xs text-gray-400';
        matchTimeSpan.textContent = formatTimeElapsed(match.createdAt);
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`;
        statusSpan.textContent = getStatusText(match.status);
        
        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex flex-col';
        headerLeft.appendChild(matchIdSpan);
        headerLeft.appendChild(matchTimeSpan);
        
        matchHeader.appendChild(headerLeft);
        matchHeader.appendChild(statusSpan);
        matchDiv.appendChild(matchHeader);

        // Conteneur des joueurs
        const playersContainer = document.createElement('div');
        playersContainer.className = 'flex items-center justify-center space-x-4';

        // Joueur 1
        const player1Box = document.createElement('div');
        player1Box.className = 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200';
        
        const player1Name = document.createElement('h3');
        player1Name.className = 'text-lg font-bold mb-2';
        player1Name.textContent = match.player1;
        
        const player1Avatar = document.createElement('div');
        player1Avatar.className = 'w-12 h-12 bg-white bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center';
        player1Avatar.innerHTML = `<span class="text-xl font-bold">${match.player1.charAt(0).toUpperCase()}</span>`;
        
        // Score du joueur 1 si disponible
        if (match.score && match.status === 'playing') {
            const player1Score = document.createElement('div');
            player1Score.className = 'text-2xl font-bold';
            player1Score.textContent = match.score.player1.toString();
            player1Box.appendChild(player1Avatar);
            player1Box.appendChild(player1Name);
            player1Box.appendChild(player1Score);
        } else {
            player1Box.appendChild(player1Avatar);
            player1Box.appendChild(player1Name);
        }

        // VS separator
        const vsDiv = document.createElement('div');
        vsDiv.className = 'flex items-center justify-center';
        
        const vsText = document.createElement('span');
        vsText.className = 'text-3xl font-bold text-gray-700 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg';
        vsText.textContent = 'VS';
        
        vsDiv.appendChild(vsText);

        // Joueur 2
        const player2Box = document.createElement('div');
        player2Box.className = 'flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200';
        
        const player2Name = document.createElement('h3');
        player2Name.className = 'text-lg font-bold mb-2';
        player2Name.textContent = match.player2;
        
        const player2Avatar = document.createElement('div');
        player2Avatar.className = 'w-12 h-12 bg-white bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center';
        player2Avatar.innerHTML = `<span class="text-xl font-bold">${match.player2.charAt(0).toUpperCase()}</span>`;
        
        // Score du joueur 2 si disponible
        if (match.score && match.status === 'playing') {
            const player2Score = document.createElement('div');
            player2Score.className = 'text-2xl font-bold';
            player2Score.textContent = match.score.player2.toString();
            player2Box.appendChild(player2Avatar);
            player2Box.appendChild(player2Name);
            player2Box.appendChild(player2Score);
        } else {
            player2Box.appendChild(player2Avatar);
            player2Box.appendChild(player2Name);
        }

        // Assembler les joueurs
        playersContainer.appendChild(player1Box);
        playersContainer.appendChild(vsDiv);
        playersContainer.appendChild(player2Box);
        matchDiv.appendChild(playersContainer);

        // Actions du match
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'flex justify-center space-x-4 mt-6';
        
        if (match.status === 'playing') {
            const watchButton = document.createElement('button');
            watchButton.className = 'px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium';
            watchButton.textContent = 'Regarder';
            watchButton.onclick = () => {
                console.log(`Regarder le match ${match.id}`);
                // Rediriger vers la page de jeu en mode spectateur
                window.location.href = `/game?watch=${match.id}`;
            };
            actionsDiv.appendChild(watchButton);
        }
        
        const detailsButton = document.createElement('button');
        detailsButton.className = 'px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium';
        detailsButton.textContent = 'Détails';
        detailsButton.onclick = () => {
            console.log(`Détails du match ${match.id}`);
            // Ici vous pouvez ajouter la logique pour afficher les détails
            alert(`Détails du match:\n\nID: ${match.id}\nJoueur 1: ${match.player1}\nJoueur 2: ${match.player2}\nStatut: ${getStatusText(match.status)}\nCréé: ${match.createdAt.toLocaleString()}`);
        };
        
        actionsDiv.appendChild(detailsButton);
        matchDiv.appendChild(actionsDiv);

        return matchDiv;
    };

    // Fonction pour charger les matchs
    const loadMatches = async () => {
        try {
            // Afficher un indicateur de chargement
            matchesContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p class="text-gray-600">Chargement des matchs...</p>
                </div>
            `;

            // Récupérer les matchs depuis le service
            const matches = await getActiveMatches();

            // Vider le conteneur
            matchesContainer.innerHTML = '';

            if (matches.length === 0) {
                // Afficher un message si aucun match
                const noMatchDiv = document.createElement('div');
                noMatchDiv.className = 'text-center py-12';
                noMatchDiv.innerHTML = `
                    <div class="text-gray-400 text-6xl mb-4">🎮</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucun match en cours</h3>
                    <p class="text-gray-500">Revenez plus tard pour voir les matchs actifs</p>
                `;
                matchesContainer.appendChild(noMatchDiv);
            } else {
                // Créer les éléments de match
                matches.forEach(match => {
                    const matchElement = createMatchElement(match);
                    matchesContainer.appendChild(matchElement);
                });

                // Afficher un résumé
                const summaryDiv = document.createElement('div');
                summaryDiv.className = 'mt-6 text-center text-gray-600';
                const playingCount = matches.filter(m => m.status === 'playing').length;
                const waitingCount = matches.filter(m => m.status === 'waiting').length;
                summaryDiv.innerHTML = `
                    <p class="text-sm">
                        <span class="font-semibold">${matches.length}</span> match(s) total • 
                        <span class="text-green-600 font-semibold">${playingCount}</span> en cours • 
                        <span class="text-yellow-600 font-semibold">${waitingCount}</span> en attente
                    </p>
                `;
                container.appendChild(summaryDiv);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des matchs:', error);
            matchesContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-semibold text-red-600 mb-2">Erreur de chargement</h3>
                    <p class="text-gray-500">Impossible de charger les matchs. Veuillez réessayer.</p>
                </div>
            `;
        }
    };

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
        loadMatches();
    };
    mainDiv.appendChild(refreshButton);

    // Variables pour gérer les mises à jour
    let unsubscribeFromUpdates: (() => void) | null = null;

    // Fonction pour démarrer les mises à jour en temps réel
    const startRealTimeUpdates = () => {
        unsubscribeFromUpdates = subscribeToMatchUpdates((matches) => {
            console.log('Mise à jour des matchs reçue:', matches.length, 'matchs');
            
            // Vider le conteneur
            matchesContainer.innerHTML = '';

            if (matches.length === 0) {
                // Afficher un message si aucun match
                const noMatchDiv = document.createElement('div');
                noMatchDiv.className = 'text-center py-12';
                noMatchDiv.innerHTML = `
                    <div class="text-gray-400 text-6xl mb-4">🎮</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucun match en cours</h3>
                    <p class="text-gray-500">Revenez plus tard pour voir les matchs actifs</p>
                `;
                matchesContainer.appendChild(noMatchDiv);
            } else {
                // Créer les éléments de match
                matches.forEach(match => {
                    const matchElement = createMatchElement(match);
                    matchesContainer.appendChild(matchElement);
                });

                // Mettre à jour le résumé
                const existingSummary = container.querySelector('.match-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }

                const summaryDiv = document.createElement('div');
                summaryDiv.className = 'mt-6 text-center text-gray-600 match-summary';
                const playingCount = matches.filter(m => m.status === 'playing').length;
                const waitingCount = matches.filter(m => m.status === 'waiting').length;
                summaryDiv.innerHTML = `
                    <p class="text-sm">
                        <span class="font-semibold">${matches.length}</span> match(s) total • 
                        <span class="text-green-600 font-semibold">${playingCount}</span> en cours • 
                        <span class="text-yellow-600 font-semibold">${waitingCount}</span> en attente
                    </p>
                `;
                container.appendChild(summaryDiv);
            }
        });
    };

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
        if (!document.contains(mainDiv)) {
            cleanup();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Charger les matchs au démarrage
    loadMatches();
    
    // Démarrer les mises à jour en temps réel
    startRealTimeUpdates();

    return mainDiv;
};
