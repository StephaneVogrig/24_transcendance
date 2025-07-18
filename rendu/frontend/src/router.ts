import { AppLayout } from './AppLayout';
import { BabylonGame } from './3d/main3d'; // Ensure this import is present

/**
 * Interface définissant le contrat pour une route.
 */
interface Route {
    path: string;
    // Le composant accepte les paramètres de chemin ET les paramètres de requête (query).
    component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement;
    regex?: RegExp;
    paramNames?: string[];
}

const appRoot = document.getElementById('app') as HTMLElement;

const routes: Route[] = [];

let appLayoutInstance: AppLayout | null = null;

/**
 * Ajoute une nouvelle route au routeur.
 * Gère les segments de chemin dynamiques (ex: '/users/:id').
 * @param path Le chemin de l'URL (ex: '/', '/login', '/users/:id').
 * @param component La fonction qui retourne l'élément DOM (HTMLElement) de la page.
 */
export function addRoute(path: string, component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement): void {
    const route: Route = { path, component };

    // Logique pour gérer les segments de chemin dynamiques (ex: /users/:id)
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)'; // Capture tout sauf '/'
    });

    route.regex = new RegExp(`^${regexPath}$`);
    route.paramNames = paramNames;

    routes.push(route);
}

/**
 * Navigue vers un nouveau chemin.
 * Met à jour l'URL et affiche le contenu de la page correspondante.
 * @param path Le chemin vers lequel naviguer (peut inclure query params et hash).
 * @param pushState Si vrai, ajoute une nouvelle entrée à l'historique du navigateur.
 * Utile pour la navigation interne (true) vs. retour/avant du navigateur (false).
 */
export function navigate(path: string, pushState: boolean = true): void {
    let matchedRoute: Route | undefined;
    let pathParams: Record<string, string> = {};
    let queryParams: Record<string, string> = {};

    // Sépare le chemin des paramètres de requête et des fragments (hash)
    const [basePath, queryStringWithHash] = path.split('?');
    const [cleanPath, hashString] = basePath.split('#'); // CleanPath will be 'basePath' if no hash, otherwise part before '#'

    // Parse les paramètres de requête
    if (queryStringWithHash) {
        // We need to parse queryString before splitting off the hash
        const [queryStringOnly] = queryStringWithHash.split('#');
        new URLSearchParams(queryStringOnly).forEach((value, key) => {
            queryParams[key] = value;
        });
    }

    // Recherche une correspondance parmi les routes en utilisant le cleanPath
    for (const route of routes) {
        if (route.regex) {
            const match = cleanPath.match(route.regex);
            if (match) {
                matchedRoute = route;
                route.paramNames?.forEach((paramName, index) => {
                    pathParams[paramName] = match[index + 1];
                });
                break;
            }
        } else if (route.path === cleanPath) { // Correspondance exacte pour les chemins sans paramètres dynamiques
            matchedRoute = route;
            break;
        }
    }

    if (matchedRoute) {
        if (pushState) {
            window.history.pushState(null, '', path);
        }

        if (appRoot) {
            const componentElement = matchedRoute.component(pathParams, queryParams);

            if (cleanPath === '/game' || cleanPath === '/auth/callback') {
                appRoot.replaceChildren();
                appLayoutInstance = null;
                appRoot.appendChild(componentElement);
                if (cleanPath === '/game') {
                    const babylonGame = BabylonGame.getInstance();
                    babylonGame.update();
                }
            } else {
                if (!appLayoutInstance) {
                    appRoot.replaceChildren();
                    appLayoutInstance = AppLayout.getInstance();
                    appRoot.appendChild(appLayoutInstance.getLayout());
                }
                appLayoutInstance.updateContent(componentElement);
            }
            addNavigationListeners(componentElement);
        }
    } else {
        console.warn(`Route non trouvée: ${path}. Redirection vers l'accueil.`);
        navigate('/');
    }
}

/**
 * Gère les clics sur les liens avec l'attribut 'data-route'.
 * Empêche le comportement par défaut du navigateur et utilise notre fonction navigate.
 * @param event L'événement de clic.
 */
function handleLinkClick(event: MouseEvent): void {
    const link = event.currentTarget as HTMLAnchorElement;
    const path = link.getAttribute('data-route');

    if (path) {
        event.preventDefault(); // Empêche le navigateur de recharger la page
        navigate(path);
    }
}

/**
 * Ajoute des écouteurs de clic à tous les liens 'data-route' dans un élément donné.
 * @param element L'élément DOM dans lequel chercher les liens (peut être l'appRoot ou un composant spécifique).
 */
function addNavigationListeners(element: HTMLElement): void {
    element.querySelectorAll('a[data-route]').forEach(link => {
        link.removeEventListener('click', handleLinkClick as EventListener); // Empêche les écouteurs dupliqués
        link.addEventListener('click', handleLinkClick as EventListener);
    });
}

/**
 * Démarre le routeur.
 * Gère la navigation initiale et les boutons avant/arrière du navigateur (`popstate`).
 */
export function startRouter(): void {
    window.addEventListener('popstate', () => {
        // Lors d'un popstate, l'URL est déjà celle souhaitée, on la navigue telle quelle,
        // y compris query params et hash. On ne push pas une nouvelle entrée.
        navigate(window.location.pathname + window.location.search + window.location.hash, false);
    });

    // Gère la navigation initiale avec l'URL complète lorsque l'application est chargée.
    navigate(window.location.pathname + window.location.search + window.location.hash);
}