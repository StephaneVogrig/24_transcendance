import { authService, User } from '../services/authService';
import { navigate } from '../router';

export const ProfilePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen bg-gray-100 py-12 px-4';

    // Conteneur principal
    const containerDiv = document.createElement('div');
    containerDiv.className = 'max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden';
    mainDiv.appendChild(containerDiv);

    // En-tête
    const headerDiv = document.createElement('div');
    headerDiv.className = 'bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white text-center';
    containerDiv.appendChild(headerDiv);

    // Photo de profil
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg';
    headerDiv.appendChild(avatarDiv);

    const avatarImg = document.createElement('img');
    avatarImg.className = 'w-full h-full object-cover';
    avatarImg.alt = 'Photo de profil';
    avatarDiv.appendChild(avatarImg);

    // Nom d'utilisateur
    const nameH1 = document.createElement('h1');
    nameH1.className = 'text-2xl font-bold mb-2';
    headerDiv.appendChild(nameH1);

    // Email
    const emailP = document.createElement('p');
    emailP.className = 'text-blue-100';
    headerDiv.appendChild(emailP);

    // Corps du profil
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'p-6';
    containerDiv.appendChild(bodyDiv);

    // Informations de compte
    const accountInfoDiv = document.createElement('div');
    accountInfoDiv.className = 'mb-6';
    bodyDiv.appendChild(accountInfoDiv);

    const accountTitle = document.createElement('h2');
    accountTitle.className = 'text-lg font-semibold text-gray-800 mb-4';
    accountTitle.textContent = 'Informations du compte';
    accountInfoDiv.appendChild(accountTitle);

    const providerDiv = document.createElement('div');
    providerDiv.className = 'flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-3';
    accountInfoDiv.appendChild(providerDiv);

    const providerLabel = document.createElement('span');
    providerLabel.className = 'text-gray-600';
    providerLabel.textContent = 'Méthode de connexion';
    providerDiv.appendChild(providerLabel);

    const providerBadge = document.createElement('span');
    providerBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
    providerDiv.appendChild(providerBadge);

    // Date de création
    const createdDiv = document.createElement('div');
    createdDiv.className = 'flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg';
    accountInfoDiv.appendChild(createdDiv);

    const createdLabel = document.createElement('span');
    createdLabel.className = 'text-gray-600';
    createdLabel.textContent = 'Membre depuis';
    createdDiv.appendChild(createdLabel);

    const createdValue = document.createElement('span');
    createdValue.className = 'text-gray-800 font-medium';
    createdDiv.appendChild(createdValue);

    // Boutons d'action
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'space-y-3';
    bodyDiv.appendChild(actionsDiv);

    // Bouton retour au dashboard
    const dashboardBtn = document.createElement('button');
    dashboardBtn.className = 'w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200';
    dashboardBtn.textContent = 'Retour au dashboard';
    actionsDiv.appendChild(dashboardBtn);

    // Bouton déconnexion
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200';
    logoutBtn.textContent = 'Se déconnecter';
    actionsDiv.appendChild(logoutBtn);

    // Message de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'text-center py-8';
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement du profil...</p>
    `;
    containerDiv.appendChild(loadingDiv);

    // Fonction pour mettre à jour l'affichage du profil
    const updateProfile = (user: User | null) => {
        if (!user) {
            // Rediriger vers la page de connexion si pas d'utilisateur
            navigate('/login');
            return;
        }

        // Cacher le chargement
        loadingDiv.style.display = 'none';

        // Mettre à jour les informations
        nameH1.textContent = user.name;
        emailP.textContent = user.email;

        // Photo de profil
        if (user.picture) {
            avatarImg.src = user.picture;
        } else {
            // Avatar par défaut
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=96`;
        }

        // Méthode de connexion (on suppose Google pour l'instant)
        providerBadge.innerHTML = `
            <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
        `;

        // Date de création (simulée)
        createdValue.textContent = new Date().toLocaleDateString('fr-FR');
    };

    // Écouter les changements d'état d'authentification
    const unsubscribe = authService.subscribe((state) => {
        if (!state.loading) {
            updateProfile(state.user);
        }
    });

    // Vérifier l'état initial
    const currentState = authService.getState();
    if (!currentState.loading) {
        updateProfile(currentState.user);
    }

    // Gestionnaires d'événements
    dashboardBtn.addEventListener('click', () => {
        navigate('/dashboard');
    });

    logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true;
        logoutBtn.textContent = 'Déconnexion...';
        
        await authService.logout();
        navigate('/login');
    });

    // Nettoyage lors de la destruction du composant
    // Note: Dans une vraie application, vous devriez appeler unsubscribe()
    // quand le composant est détruit

    return mainDiv;
};
