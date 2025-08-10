// Types pour @auth0/auth0-spa-js
declare module '@auth0/auth0-spa-js' {

  // Interface pour les options de configuration du client Auth0
  // -> initAuth0
  export interface Auth0ClientOptions {
    domain: string;
    clientId: string;
    authorizationParams?: {
      redirect_uri?: string;
      scope?: string;
    };
    cacheLocation?: 'memory' | 'localstorage';
    useRefreshTokens?: boolean;
    useRefreshTokensFallback?: boolean;
  }

  // Interface pour les options de connexion via popup
  // -> loginWithGoogle
  export interface LoginWithPopupOptions {
    authorizationParams?: {
      connection?: string;
      scope?: string;
    };
    popup?: {
      timeoutInSeconds?: number;
      popup?: Window | null;
    };
  }

  // Interface pour la gestion du callback de redirection
  export interface LogoutOptions {
    logoutParams?: {
      returnTo?: string;
    };
  }

  // Interface pour les options de récupération silencieuse du token
  // -> getUser
  export interface User {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
    [key: string]: any;
  }

  //  Interface pour le client Auth0
  // -> logout
  export class Auth0Client {
    constructor(options: Auth0ClientOptions);
    
    loginWithPopup(options?: LoginWithPopupOptions): Promise<void>;
    // MÉTHODE NON UTILISÉE - Login par redirection
    // loginWithRedirect(options?: LoginWithRedirectOptions): Promise<void>;
    // MÉTHODE NON UTILISÉE - Gestion du callback de redirection
    // handleRedirectCallback(url?: string): Promise<any>;
    isAuthenticated(): Promise<boolean>;
    getUser(): Promise<User | undefined>;
    getTokenSilently(): Promise<string>;
    logout(options?: LogoutOptions): Promise<void>;
  }
}
