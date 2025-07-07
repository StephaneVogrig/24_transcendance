export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.checkAuth();
  }

  // Vérifier l'état d'authentification au démarrage
  async checkAuth(): Promise<void> {
    this.setState({ loading: true });

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          this.setState({
            isAuthenticated: true,
            user: data.user,
            loading: false
          });
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
    }

    this.setState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }

  // Obtenir le profil utilisateur
  async getProfile(): Promise<User | null> {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          this.setState({
            isAuthenticated: true,
            user: data.user,
            loading: false
          });
          return data.user;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }

    return null;
  }

  // Se déconnecter
  async logout(): Promise<void> {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }

    this.setState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }

  // Obtenir l'état actuel
  getState(): AuthState {
    return { ...this.state };
  }

  // Écouter les changements d'état
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction de désabonnement
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Mettre à jour l'état et notifier les listeners
  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Exporter une instance singleton
export const authService = new AuthService();
