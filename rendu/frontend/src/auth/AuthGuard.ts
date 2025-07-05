import { auth0Service } from '../auth/auth0Service';
import { navigate } from '../router';

export class AuthGuard {
  static async requireAuth(): Promise<boolean> {
    try {
      await auth0Service.initialize();
      const isAuthenticated = await auth0Service.isAuthenticated();
      
      if (!isAuthenticated) {
        // Vérifier aussi si on a un token local (pour l'auth traditionnelle)
        const localToken = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
        
        if (!localToken) {
          navigate('/login');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      navigate('/login');
      return false;
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      await auth0Service.initialize();
      const isAuth0Authenticated = await auth0Service.isAuthenticated();
      
      if (isAuth0Authenticated) {
        return await auth0Service.getUser();
      }
      
      // Fallback pour l'authentification locale
      const localUser = localStorage.getItem('user');
      return localUser ? JSON.parse(localUser) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await auth0Service.initialize();
      const isAuth0Authenticated = await auth0Service.isAuthenticated();
      
      if (isAuth0Authenticated) {
        await auth0Service.logout();
      } else {
        // Logout local
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion locale en cas d'erreur
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }
}

// Écouteur pour la completion de login Auth0
window.addEventListener('auth0-login-complete', () => {
  // Rediriger vers la page de choix de jeu après connexion
  navigate('/choice-game');
});
