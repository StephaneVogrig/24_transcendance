interface Route {
  path: string;
  component: () => string;
}

const appRoot = document.getElementById('app') as HTMLElement;

const routes: Route[] = [];

/**
 * Ajoute une nouvelle route au routeur.
 * @param path Le chemin de l'URL (ex: '/', '/login')
 * @param component La fonction qui retourne le HTML de la page
 */
export function addRoute(path: string, component: () => string): void {
  routes.push({ path, component });
}

/**
 * Navigue vers un nouveau chemin.
 * Met à jour l'URL et affiche le contenu de la page correspondante.
 * @param path Le chemin vers lequel naviguer.
 * @param pushState Si vrai, ajoute une nouvelle entrée à l'historique du navigateur.
 */
export function navigate(path: string, pushState: boolean = true): void {
  const targetRoute = routes.find(route => route.path === path);

  if (targetRoute) {
    if (pushState) {
      window.history.pushState(null, '', path);
    }

    if (appRoot) {
      appRoot.innerHTML = targetRoute.component();
      addNavigationListeners(appRoot);
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
 * @param element L'élément DOM dans lequel chercher les liens.
 */
function addNavigationListeners(element: HTMLElement): void {
  element.querySelectorAll('a[data-route]').forEach(link => {
    // S'assurer qu'on n'ajoute pas plusieurs écouteurs au même lien
    link.removeEventListener('click', handleLinkClick as EventListener);
    link.addEventListener('click', handleLinkClick as EventListener);
  });
}

/**
 * Démarre le routeur.
 * Gère la navigation initiale et les boutons avant/arrière du navigateur.
 */
export function startRouter(): void {
  window.addEventListener('popstate', () => {
    navigate(window.location.pathname, false);
  });

  navigate(window.location.pathname);
}