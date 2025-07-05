import './style.css';

import { addRoute, startRouter } from './router';
import { auth0Service } from './auth/auth0Service';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChoiceGamePage } from './pages/ChoiceGamePage';
import { GamePage } from './pages/GamePage';
import { TournamentPage } from './pages/TournamentPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutPage } from './pages/AboutPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

addRoute('/', HomePage);
addRoute('/login', LoginPage);
addRoute('/register', RegisterPage);
addRoute('/choice-game', ChoiceGamePage);
addRoute('/game', GamePage);
addRoute('/tournament', TournamentPage);
addRoute('/profile', ProfilePage);
addRoute('/leaderboard', LeaderboardPage);
addRoute('/about', AboutPage);
addRoute('/auth/callback', AuthCallbackPage);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialiser Auth0 au démarrage de l'application
    await auth0Service.initialize();
    
    // Vérifier si l'utilisateur est déjà connecté
    const isAuthenticated = await auth0Service.checkAuth();
    
    if (isAuthenticated && window.location.pathname === '/login') {
      // Rediriger vers la page principale si déjà connecté
      window.location.href = '/choice-game';
      return;
    }
  } catch (error) {
    console.warn('Auth0 initialization failed:', error);
  }
  
  startRouter();
});
