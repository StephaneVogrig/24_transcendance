import { AppLayout } from './AppLayout';

// interface Route {
//     path: string;
//     component: () => HTMLElement;
// }



/**
 * Interface définissant le contrat pour une route.
 */
interface Route {
  path: string;
  // Le composant peut maintenant accepter les paramètres de chemin ET les paramètres de requête (query).
  component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement;
  regex?: RegExp; // From router_copy.ts
  paramNames?: string[]; // From router_copy.ts
}

const appRoot = document.getElementById('app') as HTMLElement;

const routes: Route[] = [];

let appLayoutInstance: AppLayout | null = null;

// /**
//  * Ajoute une nouvelle route au routeur.
//  * @param path Le chemin de l'URL (ex: '/', '/login').
//  * @param component La fonction qui retourne l'élément DOM (HTMLElement) de la page.
//  */
// export function addRoute(path: string, component: () => HTMLElement): void {
//     routes.push({ path, component });
// }

/**
 * Ajoute une nouvelle route au routeur.
 * @param path Le chemin de l'URL (ex: '/', '/login', '/users/:id').
 * @param component La fonction qui retourne l'élément DOM (HTMLElement) de la page.
 */
export function addRoute(path: string, component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement): void {
  const route: Route = { path, component }; //

  // Logic from router_copy.ts to handle dynamic path segments
  const paramNames: string[] = []; //
  const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => { //
    paramNames.push(paramName); //
    return '([^/]+)'; //
  });

  route.regex = new RegExp(`^${regexPath}$`); //
  route.paramNames = paramNames; //

  routes.push(route); //
}

// /**
//  * Navigue vers un nouveau chemin.
//  * Met à jour l'URL et affiche le contenu de la page correspondante.
//  * @param path Le chemin vers lequel naviguer.
//  * @param pushState Si vrai, ajoute une nouvelle entrée à l'historique du navigateur.
//  * Utile pour la navigation interne (true) vs. retour/avant du navigateur (false).
//  */
// export function navigate(path: string, pushState: boolean = true): void {
//     const targetRoute = routes.find(route => route.path === path);

//     if (targetRoute) {
//         if (pushState) {
//             window.history.pushState(null, '', path);
//         }
//         if (appRoot) {
//             if (path == '/game') {
//                 appRoot.replaceChildren();
//                 appLayoutInstance = null;
//                 const componentElement = targetRoute.component();
//                 appRoot.appendChild(componentElement);
//                 addNavigationListeners(componentElement);
//             } else {
//                 if (!appLayoutInstance) {
//                     appRoot.replaceChildren();
//                     appLayoutInstance = AppLayout.getInstance();
//                     appRoot.appendChild(appLayoutInstance.getLayout());
//                 }
//                 const newContent = targetRoute.component();
//                 appLayoutInstance.updateContent(newContent);
//                 addNavigationListeners(newContent);
//             }
//         }
//     } else {
//         console.warn(`Route non trouvée: ${path}. Redirection vers l'accueil.`);
//         navigate('/');
//     }
// }

/**
 * Navigue vers un nouveau chemin.
 * Met à jour l'URL et affiche le contenu de la page correspondante.
 * @param path Le chemin vers lequel naviguer (peut inclure query params et hash).
 * @param pushState Si vrai, ajoute une nouvelle entrée à l'historique du navigateur.
 * Utile pour la navigation interne (true) vs. retour/avant du navigateur (false).
 */
export function navigate(path: string, pushState: boolean = true): void {
  let matchedRoute: Route | undefined; //
  let pathParams: Record<string, string> = {}; //
  let queryParams: Record<string, string> = {}; //

  // Sépare le chemin des paramètres de requête et des fragments (hash) - Logic from router_copy.ts
  const [basePath, queryString] = path.split('?'); //
  const [cleanPath] = basePath.split('#'); // // Gérer aussi les fragments (hash) si nécessaire pour d'autres Oauth

  // Parse les paramètres de requête - Logic from router_copy.ts
  if (queryString) { //
    new URLSearchParams(queryString).forEach((value, key) => { //
      queryParams[key] = value; //
    });
  }

  // Recherche une correspondance parmi les routes en utilisant le cleanPath (sans query/hash) - Logic from router_copy.ts
  for (const route of routes) { //
    if (route.regex) { //
      const match = cleanPath.match(route.regex); //
      if (match) { //
        matchedRoute = route; //
        route.paramNames?.forEach((paramName, index) => { //
          pathParams[paramName] = match[index + 1]; //
        });
        break; //
      }
    } else if (route.path === cleanPath) { // Utilise cleanPath pour la correspondance exacte - Logic from router_copy.ts
      matchedRoute = route; //
      break; //
    }
  }

  if (matchedRoute) {
    if (pushState) { //
      window.history.pushState(null, '', path); //
    }

    if (appRoot) {
      const componentElement = matchedRoute.component(pathParams, queryParams); // Pass params and queryParams to component

      // Layout management logic from router.ts
      if (cleanPath === '/game') { // Specific handling for the '/game' route
        appRoot.replaceChildren(); // Clear all children
        appLayoutInstance = null; // Ensure no layout is used for game
        appRoot.appendChild(componentElement); // Add game component directly
      } else {
        if (!appLayoutInstance) { // If no layout instance exists, create and append it
          appRoot.replaceChildren(); // Clear root for layout
          appLayoutInstance = AppLayout.getInstance(); // Get singleton layout instance
          appRoot.appendChild(appLayoutInstance.getLayout()); // Append the main layout container
        }
        appLayoutInstance.updateContent(componentElement); // Update content within the existing layout
      }
      addNavigationListeners(componentElement); // Add listeners to new content or game component
    }
  } else {
    // If route not found, log warning and redirect to home - Common in both versions
    console.warn(`Route non trouvée: ${path}. Redirection vers l'accueil.`); //
    navigate('/'); //
  }
}

/**
 * Gère les clics sur les liens avec l'attribut 'data-route'.
 * Empêche le comportement par défaut du navigateur et utilise notre fonction navigate.
 * @param event
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
 * Gère la navigation initiale (quand la page est chargée pour la première fois)
 * et les boutons avant/arrière du navigateur (`popstate`).
 */
export function startRouter(): void {
    window.addEventListener('popstate', () => {
        navigate(window.location.pathname, false);
    });

    navigate(window.location.pathname);
}
