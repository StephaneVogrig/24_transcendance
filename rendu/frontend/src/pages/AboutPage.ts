import { navigate } from '../router';


export const AboutPage = (): HTMLElement => {

    const content = document.createElement('div');
    content.className = 'mx-auto max-w-7xl h-full w-full grid grid-rows-[auto_1fr_auto] gap-8';


    // team section
    const team = document.createElement('div');
    team.className = 'text-center pb-16 px-8';
    const h2 = document.createElement('h2');
    h2.className = 'text-3xl font-extrabold text-blue-400 mb-8';
    h2.textContent = 'The team';
    team.appendChild(h2);
    content.appendChild(team);

    // team list
    const teamList = document.createElement('ul');
    teamList.className = 'grid gap-16 sm:grid-cols-2 md:grid-cols-4 mx-auto max-w-fit mt-16';

    // component for team member
    const createTeamMember = (firstName: string, lastName: string, imgName: string): HTMLElement => {

        const li = document.createElement('li');

        const div = document.createElement('div');
        li.appendChild(div);

        div.className = 'flex flex-col items-center';
        const img = document.createElement('img');
        img.className = 'w-full sm: max-w-36 md:max-w-48 aspect-square rounded-full object-cover';
        img.src = `public/assets/${imgName}.jpg`;
        div.appendChild(img);


        const firstNameTxt = document.createElement('h3');
        firstNameTxt.className = 'text-center font-semibold text-blue-200 mt-4';
        firstNameTxt.textContent = firstName;
        div.appendChild(firstNameTxt);

        const lastNametxt = document.createElement('h3');
        lastNametxt.className = 'text-center font-semibold text-blue-200';
        lastNametxt.textContent = lastName;
        div.appendChild(lastNametxt);

        return li;
    };

    teamList.appendChild(createTeamMember('Stéphanie', 'Mortemousque', 'smortemo'));
    teamList.appendChild(createTeamMember('Gaël', 'Cannaud', 'gcannaud'));
    teamList.appendChild(createTeamMember('Sébastien', 'Craeymeersch', 'scraeyme'));
    teamList.appendChild(createTeamMember('Stephane', 'Vogrig', 'svogrig'));

    team.appendChild(teamList);
    content.appendChild(team);

    // Retourner à l'Accueil
    const backHome = document.createElement('div');
    backHome.className = 'absolute inset-x-0 bottom-5 flex flex-col';

    const backHomeBtn = document.createElement('button');
    backHomeBtn.textContent = 'back home';
    backHomeBtn.className = `text-lg font-semibold transition-transform transform hover:scale-110`;
    backHomeBtn.addEventListener('click', async () => {
        navigate('/');
        })
    backHome.appendChild(backHomeBtn);
    content.appendChild(backHome);


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
