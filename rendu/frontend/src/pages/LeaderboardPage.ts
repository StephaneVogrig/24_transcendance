
export const LeaderboardPage = (): HTMLElement => {
    // Conteneur principal
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100 p-4';

    // Carte blanche centrale
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full';
    mainDiv.appendChild(cardDiv);

    // Icône SVG
    const svgDiv = document.createElement('div');
    svgDiv.className = 'mb-6';
    svgDiv.innerHTML = `
        <svg class="mx-auto h-24 w-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
    `;
    cardDiv.appendChild(svgDiv);

    const pt = document.createElement('p');
    pt.textContent = `Leaderboard`;
    cardDiv.appendChild(pt);

    // Titre "Page en Construction"
    const h1 = document.createElement('h1');
    h1.className = 'text-4xl font-extrabold text-gray-900 mb-4';
    h1.textContent = 'Page en Construction';
    cardDiv.appendChild(h1);

    // Paragraphe descriptif
    const p = document.createElement('p');
    p.className = 'text-lg text-gray-700 mb-8';
    p.textContent = `
        Nous travaillons dur pour vous apporter cette section ! Revenez nous voir bientôt pour découvrir les nouveautés.
    `;
    cardDiv.appendChild(p);

    // Lien "Retourner à l'Accueil"
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.setAttribute('data-route', '/');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = 'Retourner à l\'Accueil';
    cardDiv.appendChild(homeLink);

    return mainDiv;
};
