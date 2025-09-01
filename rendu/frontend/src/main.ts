import { addRoute, startRouter } from './router';

import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { MatchDisplayPage } from './pages/MatchDisplayPage';

addRoute('/', HomePage);
addRoute('/game', GamePage);
addRoute('/profile', ProfilePage);
addRoute('/about', AboutPage);
addRoute('/MatchDisplay', MatchDisplayPage);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {GamePage();}, 1600);
    startRouter();
});
