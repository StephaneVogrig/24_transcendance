import type { Auth0Client } from './auth0-types';

class Auth0Service {
  private auth0Client: Auth0Client | null = null;
  private isInitialized = false;
  private isAuth0Available = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Import dynamique pour éviter les erreurs de build
      const auth0Module = await this.loadAuth0Module();
      if (!auth0Module) {
        this.isAuth0Available = false;
        this.isInitialized = true;
        return;
      }

      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirectUri = window.location.origin + '/auth/callback';

      if (!domain || !clientId) {
        console.warn('Auth0 configuration missing');
        this.isAuth0Available = false;
        this.isInitialized = true;
        return;
      }

      this.auth0Client = await auth0Module.createAuth0Client({
        domain,
        clientId,
        authorizationParams: {
          redirect_uri: redirectUri,
          scope: 'openid profile email'
        },
        cacheLocation: 'localstorage'
      });

      this.isAuth0Available = true;
      this.isInitialized = true;

      // Gérer le callback après redirection
      if (window.location.pathname === '/auth/callback') {
        await this.handleRedirectCallback();
      }
    } catch (error) {
      console.warn('Auth0 initialization failed:', error);
      this.isAuth0Available = false;
      this.isInitialized = true;
    }
  }

  private async loadAuth0Module(): Promise<any> {
    try {
      // Vérifier si le module existe dans window (si ajouté via CDN par exemple)
      if ((window as any).auth0) {
        return (window as any).auth0;
      }

      // Tentative d'import dynamique avec string pour éviter l'erreur TypeScript
      const moduleName = '@auth0/auth0-spa-js';
      const module = await import(/* webpackIgnore: true */ moduleName);
      return module;
    } catch (error) {
      console.warn('Auth0 module not available');
      return null;
    }
  }

  async loginWithRedirect(): Promise<void> {
    if (!this.isAuth0Available || !this.auth0Client) {
      console.warn('Auth0 not available, redirecting to traditional login');
      window.location.href = '/login';
      return;
    }
    
    await this.auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + '/auth/callback'
      }
    });
  }

  async handleRedirectCallback(): Promise<void> {
    if (!this.isAuth0Available || !this.auth0Client) {
      window.history.replaceState({}, document.title, '/login?error=auth_not_available');
      return;
    }

    try {
      await this.auth0Client.handleRedirectCallback();
      
      // Rediriger vers la page principale après connexion
      window.history.replaceState({}, document.title, '/choice-game');
      
      // Déclencher un événement personnalisé pour notifier l'application
      window.dispatchEvent(new CustomEvent('auth0-login-complete'));
    } catch (error) {
      console.error('Erreur lors du callback Auth0:', error);
      window.history.replaceState({}, document.title, '/login?error=auth_failed');
    }
  }

  async logout(): Promise<void> {
    if (!this.isAuth0Available || !this.auth0Client) {
      // Fallback : déconnexion locale
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return;
    }

    await this.auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.isAuth0Available || !this.auth0Client) {
      return false;
    }
    
    return await this.auth0Client.isAuthenticated();
  }

  async getUser(): Promise<any> {
    if (!this.isAuth0Available || !this.auth0Client) {
      return null;
    }

    return await this.auth0Client.getUser();
  }

  async getAccessToken(): Promise<string | undefined> {
    if (!this.isAuth0Available || !this.auth0Client) {
      return undefined;
    }

    try {
      return await this.auth0Client.getTokenSilently();
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return undefined;
    }
  }

  async checkAuth(): Promise<boolean> {
    if (!this.isAuth0Available || !this.auth0Client) {
      return false;
    }

    const isAuthenticated = await this.isAuthenticated();
    
    if (isAuthenticated) {
      const user = await this.getUser();
      const token = await this.getAccessToken();
      
      // Stocker les informations utilisateur pour l'application
      if (user && token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        return true;
      }
    }
    
    return false;
  }

  isAvailable(): boolean {
    return this.isAuth0Available;
  }
}

export const auth0Service = new Auth0Service();
