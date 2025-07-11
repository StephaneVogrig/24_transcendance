// Déclarations de types pour Vite
interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Déclarations de modules pour éviter les erreurs de build
declare module '@auth0/auth0-spa-js' {
  export class Auth0Client {
    constructor(options: any);
    loginWithRedirect(options?: any): Promise<void>;
    handleRedirectCallback(): Promise<any>;
    isAuthenticated(): Promise<boolean>;
    getUser(): Promise<any>;
    logout(options?: any): Promise<void>;
    getTokenSilently(): Promise<string>;
  }
}
