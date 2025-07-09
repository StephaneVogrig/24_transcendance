import { createSky } from '../3d/skybox';

export const HomePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white';

    // Crée le conteneur pour la scène Babylon.js
    mainDiv.appendChild(createSky());

    // Titre
    const h1 = document.createElement('h1');
    h1.className = 'text-6xl font-bold mb-8 animate-bounce';
    h1.textContent = 'Viiiiite, un Pong vite fait !';
    mainDiv.appendChild(h1);

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

    mainDiv.appendChild(nav);

    return mainDiv;
}
