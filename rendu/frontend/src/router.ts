import { AppLayout } from './AppLayout';
import { BabylonGame } from './3d/main3d';

/**
 * Interface définissant le contrat pour une route.
 */
interface Route {
    path: string;
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
    const [cleanPath, hashString] = basePath.split('#');
    void hashString;

    // Parse les paramètres de requête
    if (queryStringWithHash) {
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
        } else if (route.path === cleanPath) {
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
        link.removeEventListener('click', handleLinkClick as EventListener);
        link.addEventListener('click', handleLinkClick as EventListener);
    });
}

/**
 * Démarre le routeur.
 * Gère la navigation initiale et les boutons avant/arrière du navigateur (`popstate`).
 */
export function startRouter(): void {
    window.addEventListener('popstate', () => {
        try 
        {
            const currentPath = window.location.pathname;
            console.log('Popstate event triggered. Current path:', currentPath);
            console.log(window.location.search, window.location.hash);

            // Cas particulier pour la page profile : toujours rediriger vers l'accueil
            if (currentPath === '/profile') 
            {
                navigate('/', false);
                return;
            }
            
            // Lors d'un popstate, l'URL est déjà celle souhaitée, on la navigue telle quelle,
            // y compris query params et hash. On ne push pas une nouvelle entrée.
            navigate(window.location.pathname + window.location.search + window.location.hash, false);
        }
        catch (error) {
            console.error('Erreur lors de la navigation popstate:', error);
            navigate('/', false);
        }
    });

    try 
    {
        navigate(window.location.pathname + window.location.search + window.location.hash);
    } 
    catch (error) {
        console.error('Erreur lors de la navigation initiale:', error);
        navigate('/');
    }
}
