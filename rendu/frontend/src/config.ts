const PORT = import.meta.env.VITE_PROXY_PORT;
console.log(`port=${PORT}`);
export const BASE_URL = `https://${window.location.hostname}:${PORT}`;
export const API_BASE_URL = `${BASE_URL}/api`;