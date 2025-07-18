/**
 * Service pour gérer les matchs en cours
 */

const MATCHMAKING_SERVICE_URL = 'http://localhost:3002'; // Port du service matchmaking

export interface Match {
    id: string;
    player1: string;
    player2: string;
    status: 'waiting' | 'playing' | 'finished';
    score?: {
        player1: number;
        player2: number;
    };
    createdAt: Date;
    updatedAt: Date;
}


// //recuperer les informations du tournoi
// export async function getTournamentInfo(tournamentId: string): Promise<any> {
//     try {
//         const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/getAll`, {
//             method: 'GET',
//             headers: { 'Content-Type': 'application/json' },
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // Assumer que la réponse est un tableau de tournois
//         // et trouver celui qui correspond à tournamentId

//         const data = await response.json();
//         console.log('Liste des tournois:', data);
//         return data.find((tournament: any) => tournament.id === tournamentId);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des informations du tournoi:', error);
//         throw error;
//     }
// }

    //recuperer tous les tournois
    export async function getActiveMatches(): Promise<any> {
        try {
            const response = await fetch(`http://${window.location.hostname}:3003/api/database/tournament/getAll`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const tournaments = await response.json();
            // console.log('Liste des tournois:', tournaments);
            // // converit tournaments en tableau de Match
            console.log('Liste des tournois:', tournaments);
            // const matches = tournaments.map((tournament: any) => ({
            //     id: `tournament_${tournament.id}`,
            //     player1: tournament.playerNames ? tournament.playerNames[0] : 'Joueur 1',
            //     player2: tournament.playerNames ? tournament.playerNames[1] : 'Joueur 2',
            //     status: tournament.status === 'open' ? 'waiting' : 
            //              tournament.status === 'ongoing' ? 'playing' : 'finished',
            //     score: tournament.status === 'ongoing' && tournament.bracket ? {
            //         player1: tournament.bracket[0] ? tournament.bracket[0][0]?.score || 0 : 0,
            //         player2: tournament.bracket[0] ? tournament.bracket[0][1]?.score || 0 : 0
            //     } : undefined,
            //     createdAt: new Date(tournament.createdAt),
            //     updatedAt: new Date()
            // }));
            // console.log('Tournaments convertis en matches:', matches);
            // return matches; // Retourne le tableau de matchs
            // Retourne le tableau de matchs
            return tournaments;
        } catch (error) {
            console.error('Erreur lors de la récupération des tournois:', error);
            throw error;
        }
    }

    // Test des APIs de tournoi au chargement de la page
    // testTournamentAPI();

    // Appel de la fonction pour récupérer les informations du tournoi
    // getTournamentInfo(1).then(tournament => {
    //     console.log('Informations du tournoi spécifique:', tournament);
    // }).catch(error => {
    //     console.error('Erreur lors de la récupération des informations du tournoi:', error);
    // });

    // Appel de la fonction pour récupérer tous les tournois
    // getActiveMatches().then(tournaments => {
    //     console.log('Tous les tournois:', tournaments);
    // }).catch(error => {
    //     console.error('Erreur lors de la récupération des tournois:', error);
    // });



/**
 * Récupère la liste des matchs en cours
 */
// export async function getActiveMatches(): Promise<Match[]> {
//     try {
//         const response = await fetch(`${MATCHMAKING_SERVICE_URL}/api/matches/active`);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         return data.matches || [];
//     } catch (error) {
//         console.error('Erreur lors de la récupération des matchs:', error);
//         // Retourner des données de simulation en cas d'erreur
//         return getSimulatedMatches();
//     }
// }

/**
 * Récupère les détails d'un match spécifique
 */
export async function getMatchDetails(matchId: string): Promise<Match | null> {
    try {
        const response = await fetch(`${MATCHMAKING_SERVICE_URL}/api/matches/${matchId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.match;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du match:', error);
        return null;
    }
}

/**
 * S'abonne aux mises à jour des matchs via WebSocket
 */
export function subscribeToMatchUpdates(callback: (matches: Match[]) => void): () => void {
    let isSubscribed = true;
    console.log('Abonnement aux mises à jour des matchs...');
    // Utiliser un intervalle pour simuler les mises à jour
    // En production, vous devriez utiliser WebSocket ou une autre méthode de notification en temps réel
    const updateMatches = async () => {
        if (!isSubscribed) return;
        
        try {
            const matches = await getActiveMatches();
            callback(matches);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des matchs:', error);
        }
        
        // Programmer la prochaine mise à jour
        if (isSubscribed) {
            setTimeout(updateMatches, 5000); // Mise à jour toutes les 5 secondes
        }
    };
    
    // Démarrer les mises à jour
    updateMatches();
    
    // Retourner une fonction de désabonnement
    return () => {
        isSubscribed = false;
    };
}

// /**
//  * Génère des matchs de simulation pour le développement
//  */
// function getSimulatedMatches(): Match[] {
//     const playerNames = [
//         'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
//         'Ivy', 'Jack', 'Karen', 'Leo', 'Mia', 'Nick', 'Olivia', 'Peter',
//         'Quinn', 'Rachel', 'Steve', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier'
//     ];
    
//     const matches: Match[] = [];
//     const numMatches = Math.floor(Math.random() * 8) + 2; // 2-10 matchs
    
//     for (let i = 0; i < numMatches; i++) {
//         const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
//         const player1 = shuffled[0];
//         const player2 = shuffled[1];
        
//         const statuses: Match['status'][] = ['waiting', 'playing', 'playing', 'playing']; // Plus de matchs en cours
//         const status = statuses[Math.floor(Math.random() * statuses.length)];
        
//         const match: Match = {
//             id: `match_${i + 1}_${Date.now()}`,
//             player1,
//             player2,
//             status,
//             createdAt: new Date(Date.now() - Math.random() * 3600000), // Dernière heure
//             updatedAt: new Date(),
//         };
        
//         if (status === 'playing') {
//             match.score = {
//                 player1: Math.floor(Math.random() * 5),
//                 player2: Math.floor(Math.random() * 5)
//             };
//         }
        
//         matches.push(match);
//     }
    
//     return matches;
// }

/**
 * Formate le temps écoulé depuis la création du match
 */
export function formatTimeElapsed(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
        return 'À l\'instant';
    } else if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}min`;
    }
}

/**
 * Retourne la couleur appropriée pour le statut du match
 */
export function getStatusColor(status: Match['status']): string {
    switch (status) {
        case 'waiting':
            return 'bg-yellow-100 text-yellow-800';
        case 'playing':
            return 'bg-green-100 text-green-800';
        case 'finished':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Retourne le texte d'affichage pour le statut du match
 */
export function getStatusText(status: Match['status']): string {
    switch (status) {
        case 'waiting':
            return 'En attente';
        case 'playing':
            return 'En cours';
        case 'finished':
            return 'Terminé';
        default:
            return 'Inconnu';
    }
}
