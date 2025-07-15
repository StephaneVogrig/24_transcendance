import { bottomBtn } from './components/bottomBtn';
import { teamMember } from './components/teamMember';

export const AboutPage = (): HTMLElement => {

    const content = document.createElement('div');
    content.className = 'mx-auto max-w-7xl h-full w-full grid grid-rows-[auto_1fr_auto] gap-8';

    const team = document.createElement('div');
    team.className = 'text-center pb-16 px-8';
    content.appendChild(team);

    const h2 = document.createElement('h2');
    h2.className = 'text-3xl font-extrabold text-blue-400 mb-8';
    h2.textContent = 'The team';
    team.appendChild(h2);

    const teamList = document.createElement('ul');
    teamList.className = 'grid gap-16 sm:grid-cols-2 md:grid-cols-4 mx-auto max-w-fit mt-16';
    teamList.appendChild(teamMember('Stéphanie', 'Mortemousque', 'smortemo'));
    teamList.appendChild(teamMember('Gaël', 'Cannaud', 'gcannaud'));
    teamList.appendChild(teamMember('Sébastien', 'Craeymeersch', 'scraeyme'));
    teamList.appendChild(teamMember('Stephane', 'Vogrig', 'svogrig'));
    team.appendChild(teamList);

    content.appendChild(bottomBtn('back home', '/'));

    return content;
};
