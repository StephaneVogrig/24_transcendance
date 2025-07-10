/**
 * Interface définissant le contrat pour une route.
 */
interface Route {
  path: string;
  // Le composant peut maintenant accepter les paramètres de chemin ET les paramètres de requête (query).
  component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement;
  regex?: RegExp;
  paramNames?: string[];
}

// L'élément racine de l'application où le contenu des pages sera injecté.
const appRoot = document.getElementById('app') as HTMLElement;

// Tableau pour stocker toutes les routes enregistrées.
const routes: Route[] = [];

/**
 * Ajoute une nouvelle route au routeur.
 * @param path Le chemin de l'URL (ex: '/', '/login').
 * @param component La fonction qui retourne l'élément DOM (HTMLElement) de la page.
 */
export function addRoute(path: string, component: (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement): void {
  const route: Route = { path, component };

  const paramNames: string[] = [];
  const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  route.regex = new RegExp(`^${regexPath}$`);
  route.paramNames = paramNames;

  routes.push(route);
}

/**
 * Navigue vers un nouveau chemin.
 * Met à jour l'URL et affiche le contenu de la page correspondante.
 * @param path Le chemin vers lequel naviguer.
 * @param pushState Si vrai, ajoute une nouvelle entrée à l'historique du navigateur.
 * Utile pour la navigation interne (true) vs. retour/avant du navigateur (false).
 */
export function navigate(path: string, pushState: boolean = true): void {
  let matchedRoute: Route | undefined;
  let pathParams: Record<string, string> = {};
  let queryParams: Record<string, string> = {};

  // Sépare le chemin des paramètres de requête
  const [basePath, queryString] = path.split('?');
  const [cleanPath] = basePath.split('#'); // Gérer aussi les fragments (hash) si nécessaire pour d'autres Oauth

  // Parse les paramètres de requête
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  // Recherche une correspondance parmi les routes en utilisant le basePath (sans query/hash)
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
    } else if (route.path === cleanPath) { // Utilise cleanPath pour la correspondance exacte
      matchedRoute = route;
      break;
    }
  }

  if (matchedRoute) {
    // Si la route a été trouvée avec des query params, nous devons les conserver dans l'URL du navigateur.
    // Cependant, pour l'authentification Google, une fois le code traité, il est souvent préférable de le retirer.
    // Pour l'instant, nous conservons l'URL telle qu'elle est venue pour le pushState.
    // Le "nettoyage" de l'URL se fera après le traitement du code.
    if (pushState) {
      // Met à jour l'URL du navigateur sans recharger la page.
      window.history.pushState(null, '', path);
    }

    if (appRoot) {
      // Vide l'élément racine de tout contenu précédent.
      // appRoot.innerHTML = ''; est simple, mais appRoot.replaceChildren() est plus moderne et potentiellement plus performant
      // car il ne force pas une ré-analyse HTML complète à chaque fois.
      appRoot.innerHTML = ''; // Nettoyage de l'ancien contenu
      // Passe les paramètres de chemin ET les paramètres de requête au composant.
      const componentElement = matchedRoute.component(pathParams, queryParams);

    // Ajoute le nouvel élément DOM à l'élément racine de l'application.
      appRoot.appendChild(componentElement);

      // Ré-attache les écouteurs de navigation pour les liens 'data-route'
      // présents dans le HTML du nouveau composant. C'est crucial car les nouveaux
      // éléments ont été créés et leurs écouteurs doivent être mis en place.
      addNavigationListeners(componentElement);
    }
  } else {
    // Si la route n'est pas trouvée, log un avertissement et redirige vers la page d'accueil.
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
  // Sélectionne tous les liens avec l'attribut 'data-route' à l'intérieur de l'élément fourni.
  element.querySelectorAll('a[data-route]').forEach(link => {
    // S'assurer qu'on n'ajoute pas plusieurs écouteurs au même lien.
    // removeEventListener avant addEventListener est une bonne pratique pour éviter les doublons.
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
  // Écoute les changements dans l'historique du navigateur (ex: clic sur les boutons retour/avant).
  window.addEventListener('popstate', () => {
    // Navigue vers le chemin actuel du navigateur sans ajouter une nouvelle entrée à l'historique.
    // Lors d'un popstate, l'URL est déjà celle souhaitée, on la navigue telle quelle, y compris query params
    navigate(window.location.pathname + window.location.search + window.location.hash, false);
  });

  // Gère la navigation initiale avec l'URL complète lorsque l'application est chargée.
  navigate(window.location.pathname + window.location.search + window.location.hash);
}