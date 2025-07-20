import './style.css';

import { addRoute, startRouter } from './router';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutPage } from './pages/AboutPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
// import { MatchListPage } from './pages/matchList';
import { TestPage } from './pages/TestPage';



addRoute('/', HomePage);
addRoute('/login', LoginPage);
addRoute('/register', RegisterPage);
addRoute('/game', GamePage);
addRoute('/profile', ProfilePage);
addRoute('/leaderboard', LeaderboardPage);
addRoute('/about', AboutPage);
addRoute('/auth/callback', AuthCallbackPage);
// addRoute('/matches', MatchListPage);
addRoute('/test', TestPage);



document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {GamePage();}, 1600);
    startRouter();
});
