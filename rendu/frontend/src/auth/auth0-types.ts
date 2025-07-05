// Types Auth0 pour éviter les erreurs de compilation si le module n'est pas disponible
export interface Auth0Client {
  loginWithRedirect(options?: any): Promise<void>;
  handleRedirectCallback(): Promise<void>;
  logout(options?: any): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getUser(): Promise<any>;
  getTokenSilently(): Promise<string>;
}

export interface Auth0Config {
  domain: string;
  clientId: string;
  authorizationParams?: {
    redirect_uri: string;
    scope?: string;
  };
  cacheLocation?: string;
}

export declare function createAuth0Client(config: Auth0Config): Promise<Auth0Client>;
