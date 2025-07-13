export const HomePage = (): HTMLElement => {

    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex flex-col items-center';

    // Navigation
    const nav = document.createElement('nav');
    nav.className = 'flex flex-col space-y-4';

    // Fonction utilitaire pour créer un lien de navigation
    const createNavLink = (text: string, route: string, className: string): HTMLAnchorElement => {
        const link = document.createElement('a');
        link.href = '#'; // Le href est souvent un '#' ou le chemin réel pour l'accessibilité
        link.setAttribute('data-route', route);
        link.className = className;
        link.textContent = text;
        return link;
    };

    nav.appendChild(createNavLink('Choisir jeu', '/choice-game', 'btn btn-primary'));
    nav.appendChild(createNavLink('Jouer', '/game', 'btn btn-secondary'));
    nav.appendChild(createNavLink('Tournois', '/tournament', 'btn btn-secondary'));
    nav.appendChild(createNavLink('Profil', '/profile', 'btn btn-secondary'));
    nav.appendChild(createNavLink('Classement', '/leaderboard', 'btn btn-secondary'));
    nav.appendChild(createNavLink('À propos', '/about', 'btn btn-secondary'));
    nav.appendChild(createNavLink('Se connecter', '/login', 'btn btn-outline'));
    nav.appendChild(createNavLink('S\'inscrire', '/register', 'btn btn-outline'));

    contentDiv.appendChild(nav);

    return contentDiv;
}
