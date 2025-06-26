import './style.css';

import { addRoute, startRouter } from './router';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChoiceGamePage } from './pages/ChoiceGamePage';
import { GamePage } from './pages/GamePage';
import { TournamentPage } from './pages/TournamentPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutPage } from './pages/AboutPage';

addRoute('/', HomePage);
addRoute('/login', LoginPage);
addRoute('/register', RegisterPage);
addRoute('/choice-game', ChoiceGamePage);
addRoute('/game', GamePage);
addRoute('/tournament', TournamentPage);
addRoute('/profile', ProfilePage);
addRoute('/leaderboard', LeaderboardPage);
addRoute('/about', AboutPage);

document.addEventListener('DOMContentLoaded', () => {
  startRouter();
});
