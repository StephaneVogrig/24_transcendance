// Types pour @auth0/auth0-spa-js
declare module '@auth0/auth0-spa-js' {
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

  export interface LoginWithRedirectOptions {
    authorizationParams?: {
      connection?: string;
      redirect_uri?: string;
    };
  }

  export interface LogoutOptions {
    logoutParams?: {
      returnTo?: string;
    };
  }

  export interface User {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
    [key: string]: any;
  }

  export class Auth0Client {
    constructor(options: Auth0ClientOptions);
    
    loginWithPopup(options?: LoginWithPopupOptions): Promise<void>;
    loginWithRedirect(options?: LoginWithRedirectOptions): Promise<void>;
    handleRedirectCallback(url?: string): Promise<any>;
    isAuthenticated(): Promise<boolean>;
    getUser(): Promise<User | undefined>;
    getTokenSilently(): Promise<string>;
    logout(options?: LogoutOptions): Promise<void>;
  }
}
