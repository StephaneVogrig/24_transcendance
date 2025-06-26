// interface Route {
//   path: string;
//   component: () => string;
// }

interface ComponentResult {
  html: string;
  onMount?: () => (() => void) | void; // Fonction à exécuter après le rendu, retourne une fonction de nettoyage
}

interface Route {
  path: string;
  component: () => ComponentResult; // Le composant retourne maintenant un ComponentResult
}

const appRoot = document.getElementById('app') as HTMLElement;

const routes: Route[] = [];
let currentCleanup: (() => void) | void = undefined; // Pour stocker la fonction de nettoyage de la page précédente

/**
 * Ajoute une nouvelle route au routeur.
 * @param path Le chemin de l'URL (ex: '/', '/login')
 * @param component La fonction qui retourne le HTML de la page
 */
export function addRoute(path: string, component: () => ComponentResult): void {
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
      // Exécuter la fonction de nettoyage de la page précédente si elle existe
      if (currentCleanup && typeof currentCleanup === 'function') {
        currentCleanup();
      }

      const componentResult = targetRoute.component(); // Obtenir l'objet { html, onMount }
      appRoot.innerHTML = componentResult.html; // Injecter le HTML

      addNavigationListeners(appRoot); // Ré-attache les écouteurs de navigation globaux

      // Exécuter la logique spécifique à la page si elle est définie
      if (componentResult.onMount) {
        currentCleanup = componentResult.onMount(); // Stocker la fonction de nettoyage de la nouvelle page
      } else {
        currentCleanup = undefined; // Pas de fonction de nettoyage pour cette page
      }
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
