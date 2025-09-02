const PORT = (import.meta as any).env.VITE_PROXY_PORT || '3000';
console.log(`port=${PORT}`);
export const BASE_URL = `https://${window.location.hostname}:${PORT}`;
export const API_BASE_URL = `${BASE_URL}/api`;

// Configuration OAuth 2.0 Google 
export const GOOGLE_OAUTH_CONFIG = {
    CLIENT_ID: '316874582743-ntu3nvld3lh4iodhmjup7uj836eujt0g.apps.googleusercontent.com', // Même que le backend
    REDIRECT_URI: `${BASE_URL}/auth-callback-popup.html`, // URI fixe pour éviter les problèmes
    REDIRECT_URI_MAIN: `${BASE_URL}/auth/callback`, // Callback principal (si besoin)
    SCOPE: 'openid profile email',
    RESPONSE_TYPE: 'code',
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth'
};