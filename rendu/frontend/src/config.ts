export const PORT = (import.meta as any).env.VITE_PROXY_PORT || '3000';
export const HOST_DOMAIN = (import.meta as any).env.VITE_HOST_DOMAIN;
export const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

export const BASE_URL = `https://${window.location.hostname}:${PORT}`;
export const API_BASE_URL = `${BASE_URL}/api`;

export const GOOGLE_REDIRECT_URI = `https://${HOST_DOMAIN}:${PORT}/auth-callback-popup.html`;

console.debug(`PORT                : ${PORT}
HOST_DOMAIN         : ${HOST_DOMAIN}
GOOGLE_CLIENT_ID    : ${GOOGLE_CLIENT_ID}
BASE_URL            : ${BASE_URL}
API_BASE_URL        : ${API_BASE_URL}
GOOGLE_REDIRECT_URI : ${GOOGLE_REDIRECT_URI}`);
