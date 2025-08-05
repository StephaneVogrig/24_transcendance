import { API_BASE_URL } from '../config.ts';

/**
 * Service pour gérer les matchs en cours
 */

export interface Match {
    id: string;
    // playercount: number;
    player1: string;
    player2: string;
    status: string; //'waiting'  'playing'  'finished';
    score?: {
        player1: number;
        player2: number;
    };
}


export async function getWinner(id: string): Promise<string | null> {
    try 
    {
        const response = await fetch(`${API_BASE_URL}/tournament/winner/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.winner || null;
    } 
    catch (error) {
        console.error('Erreur lors de la récupération du gagnant:', error);
        throw error;
    }
}



//recuperer tous les matchs actifs
export async function getTournament(): Promise<any> {
    try 
    {
        const response = await fetch(`${API_BASE_URL}/database/tournament/getAll`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) 
            throw new Error(`HTTP error! status: ${response.status}`);

        console.log('+++ getTournament() RESPONSE FETCH -> GET +++', response);

        const tournaments = await response.json(); // Récupérer les tournois en format JSON 

        return tournaments;
    } 
    catch (error) {
        console.error('Erreur lors de la récupération des tournois:', error);
        throw error;
    }
}


//
// function filterAndParseTournaments(tournaments: any[], status: string): Promise<Match[]> 
// {
//     return Promise.resolve(tournaments.filter((tournament: any) => 
//     {
//         try 
//         {
//             const parsedTournament = JSON.parse(tournament.data);
//             return parsedTournament.status === status;
//         } 
//         catch (error) {
//             console.error("Erreur lors du parsing du tournament data:", error);
//             return false; // Exclure ce tournoi si le parsing échoue
//         }
//     }).map((tournament: any) => 
//     {
//         try 
//         {
//             return JSON.parse(tournament.data);
//         } 
//         catch (error) {
//             console.error("Erreur lors du parsing du tournament data:", error);
//             return null; // Retourner null si le parsing échoue
//         }
//     }).filter((tournament: any) => tournament !== null) as Match[]);
// }



// function filterTournamentsByStatus(tournaments: any[], status: string): any[] 
// {
//     return tournaments.filter((tournament: any) => {
//         try 
//         {
//             const parsedTournament = JSON.parse(tournament.data);
//             return parsedTournament.status === status;
//         } catch (error) {
//             console.error("Erreur lors du parsing du tournament data:", error);
//             return false;
//         }
//     });
// }

function filterTournamentsByStatus(tournaments: any[], status: string): any[] 
{
    tournaments = tournaments.filter((tournament: any) => {
        try 
        {
            const parsedTournament = JSON.parse(tournament.data);
            return parsedTournament.status === status;
        } catch (error) {
            console.error("Erreur lors du parsing du tournament data:", error);
            return false;
        }
    });
    return tournaments as any[];
}

// function parseTournaments(tournaments: any[]): Match[] 
// {
//     return tournaments.map((tournament: any) => {
//             try {
//                 return JSON.parse(tournament.data);
//             } catch (error) {
//                 console.error("Erreur lors du parsing du tournament data:", error);
//                 return null;
//             }
//         })
//         .filter((tournament: any): tournament is Match => tournament !== null);
// }

function parseTournaments(tournaments: any[]): Match[] 
{
   tournaments = tournaments.map((tournament: any) => {
        try 
        {
            return JSON.parse(tournament.data);
        } 
        catch (error) {
            console.error("Erreur lors du parsing du tournament data:", error);
            return null;
        }
    })
    tournaments = tournaments.filter((tournament: any): tournament is Match => tournament !== null);
    return tournaments as Match[];
}

function filterAndParseTournaments(tournaments: any[], status: string): Promise<Match[]> 
{
    const filtered = filterTournamentsByStatus(tournaments, status);
    const parsed = parseTournaments(filtered);
    return Promise.resolve(parsed);
}
    

//recuperer tous les tournois selon le status 
//retourne un tableau de .json
export async function getTournamentsType( status: string): Promise<any> 
{
    try 
    {
        const allTournament = getTournament();
        
        const tournaments = await allTournament;
        const filteredTournaments = await filterAndParseTournaments(tournaments, status);

        return filteredTournaments;

    }
    catch (error) {
        console.error('ENDED   Erreur lors de la récupération des tournois', error);
        throw error;
    }
}

