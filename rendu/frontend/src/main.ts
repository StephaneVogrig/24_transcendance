// import './style.css';

import { addRoute, startRouter } from './router';

import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutPage } from './pages/AboutPage';
import { MatchDisplayPage } from './pages/MatchDisplayPage';
import { createAuthCallbackPage } from './pages/AuthCallbackPage';



addRoute('/', HomePage);
addRoute('/game', GamePage);
addRoute('/profile', ProfilePage);
addRoute('/leaderboard', LeaderboardPage);
addRoute('/about', AboutPage);
addRoute('/MatchDisplay', MatchDisplayPage);
addRoute('/auth/callback', createAuthCallbackPage);



document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {GamePage();}, 1600);
    startRouter();
});
