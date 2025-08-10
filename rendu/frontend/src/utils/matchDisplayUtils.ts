import { API_BASE_URL } from '../config.ts';

export interface Match {
    id: string;
    player1: string;
    player2: string;
    status: string; //'waiting'  'playing'  'finished';
    score?: {
        player1: number;
        player2: number;
    };
}

// Récupérer tous les tournois en appellant le docker tournament
export async function getListOfTournaments(): Promise<any> 
{
    return fetch(`${API_BASE_URL}/tournament/getAllTournaments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des tournois:', error);
        throw error;
    });
}


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
        const tournaments = await getListOfTournaments();
        const filteredTournaments = await filterAndParseTournaments(tournaments, status);
        return filteredTournaments;
    }
    catch (error) {
        console.error('ENDED   Erreur lors de la récupération des tournois', error);
        throw error;
    }
}


