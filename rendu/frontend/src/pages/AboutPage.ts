import { bottomBtn } from './components/bottomBtn';
import { teamMember } from './components/teamMember';
import { locale } from '../i18n';


export const AboutPage = (): HTMLElement => {

    const content = document.createElement('div');
    content.className = 'mx-auto max-w-7xl h-full w-full grid grid-rows-[auto_1fr_auto] gap-8';

    const team = document.createElement('div');
    team.className = 'text-center pb-16 px-8';
    content.appendChild(team);

    const h2 = document.createElement('h2');
    h2.className = 'text-3xl font-extrabold text-blue-400 mb-8';
    h2.textContent = locale.team;
    team.appendChild(h2);

    const teamList = document.createElement('ul');
    teamList.className = 'grid gap-16 sm:grid-cols-2 md:grid-cols-4 mx-auto max-w-fit mt-16';
    teamList.appendChild(teamMember('Stéphanie', 'Mortemousque', 'smortemo'));
    teamList.appendChild(teamMember('Gaël', 'Cannaud', 'gcannaud'));
    teamList.appendChild(teamMember('Sébastien', 'Craeymeersch', 'scraeyme'));
    teamList.appendChild(teamMember('Stephane', 'Vogrig', 'svogrig'));
    team.appendChild(teamList);

    content.appendChild(bottomBtn(locale.back_home, '/'));


    //recuperer les informations du tournoi
    async function getTournamentInfo(tournamentId: number): Promise<any> {
        try {
            const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/get?id=${tournamentId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Informations du tournoi:', data);
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du tournoi:', error);
            throw error;
        }
    }

    //recuperer tous les tournois
    async function getAllTournaments(): Promise<any> {
        try {
            const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/getAll`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Liste des tournois:', data);
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des tournois:', error);
            throw error;
        }
    }

    // Test des APIs de tournoi au chargement de la page
    // testTournamentAPI();

    // Appel de la fonction pour récupérer les informations du tournoi
    getTournamentInfo(1).then(tournament => {
        console.log('Informations du tournoi spécifique:', tournament);
    }).catch(error => {
        console.error('Erreur lors de la récupération des informations du tournoi:', error);
    });

    // Appel de la fonction pour récupérer tous les tournois
    getAllTournaments().then(tournaments => {
        console.log('Tous les tournois:', tournaments);
    }).catch(error => {
        console.error('Erreur lors de la récupération des tournois:', error);
    });


    return content;
};
