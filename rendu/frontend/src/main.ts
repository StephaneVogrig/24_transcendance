import './style.css';

import { addRoute, startRouter } from './router';

import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutPage } from './pages/AboutPage';
import { MatchDisplayPage } from './pages/MatchDisplayPage';



addRoute('/', HomePage);
addRoute('/register', RegisterPage);
addRoute('/game', GamePage);
addRoute('/profile', ProfilePage);
addRoute('/leaderboard', LeaderboardPage);
addRoute('/about', AboutPage);
addRoute('/MatchDisplay', MatchDisplayPage);



document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {GamePage();}, 1600);
    startRouter();
});
