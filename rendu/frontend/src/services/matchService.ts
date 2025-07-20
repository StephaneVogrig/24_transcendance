/**
 * Service pour gérer les matchs en cours
 */

export interface Match {
    id: string;
    // playercount: number;
    player1: string;
    player2: string;
    status: string;//'waiting' | 'playing' | 'finished';
    score?: {
        player1: number;
        player2: number;
    };
}

//recuperer tous les matchs actifs
export async function getTournament(): Promise<any> {
    try {
        const response = await fetch(`http://${window.location.hostname}:3003/api/database/tournament/getAll`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Récupérer les tournois
        const tournaments = await response.json();
        console.log('Liste des tournois:', tournaments);

        // boucler sur les tournois et afficher les informations :  
        for (const tournament of tournaments) {
        console.log('*Tournament ID:', tournament.id);
        console.log('*Tournament data:', tournament.data);
        
        // Parser le JSON si nécessaire
        const parsedTournament = JSON.parse(tournament.data);
        console.log('*Tournament createdBy:', parsedTournament.createdBy);
        console.log('*Tournament status:', parsedTournament.status);
        }


        return tournaments;
    } catch (error) {
        console.error('Erreur lors de la récupération des tournois:', error);
        throw error;
    }
}

    function filterAndParseTournaments(tournaments: any[], status: string): Promise<Match[]> {
        return Promise.resolve(tournaments.filter((tournament: any) => {
        try {
            const parsedTournament = JSON.parse(tournament.data);
            return parsedTournament.status === status;
        } 
        catch (error) {
            console.error("Erreur lors du parsing du tournament data:", error);
            return false; // Exclure ce tournoi si le parsing échoue
        }
        }).map((tournament: any) => {
        try {
            return JSON.parse(tournament.data);
        } 
        catch (error) {
            console.error("Erreur lors du parsing du tournament data:", error);
            return null; // Retourner null si le parsing échoue
        }
        }).filter((tournament: any) => tournament !== null) as Match[]);
    }
    

//recuperer tous les tournois selon le status 
//retourne un tableau de .json
export async function getTournamentsType( status: string): Promise<any> {
    try {
        const allTournament = getTournament();
        
        const tournaments = await allTournament;
        const filteredTournaments = await filterAndParseTournaments(tournaments, status);

        return filteredTournaments;

        } catch (error) {
        console.error('ENDED   Erreur lors de la récupération des tournois', error);
        throw error;
        }
}

