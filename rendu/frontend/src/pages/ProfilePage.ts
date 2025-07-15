import { isAuthenticated, getUser, logout } from '../auth/auth0Service';
import { navigate } from '../router';

export const ProfilePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6';

    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'max-w-2xl mx-auto';
    mainDiv.appendChild(container);

    // Titre
    const title = document.createElement('h1');
    title.className = 'text-4xl font-bold text-center text-gray-800 mb-8';
    title.textContent = 'Statut d\'Authentification';
    container.appendChild(title);

    // Zone de statut
    const statusDiv = document.createElement('div');
    statusDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(statusDiv);

    // Zone d'informations utilisateur
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(userInfoDiv);

    // Zone d'actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'bg-white rounded-lg shadow-lg p-6';
    container.appendChild(actionsDiv);

    // Fonction pour mettre à jour le statut
    const updateStatus = async () => {
        try {
            // Afficher un indicateur de chargement
            statusDiv.innerHTML = `
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Vérification du statut d'authentification...</p>
                </div>
            `;

            userInfoDiv.innerHTML = '';
            actionsDiv.innerHTML = '';

            // Vérifier l'authentification
            const authenticated = await isAuthenticated();

            if (authenticated) {
                // Utilisateur connecté
                statusDiv.innerHTML = `
                    <div class="text-center">
                        <div class="text-green-600 text-6xl mb-4">✅</div>
                        <h3 class="text-xl font-semibold text-green-600 mb-2">Utilisateur Connecté</h3>
                        <p class="text-gray-600">Vous êtes authentifié avec succès</p>
                    </div>
                `;

                // Récupérer les informations utilisateur
                try {
                    const user = await getUser();
                    if (user) {
                        userInfoDiv.innerHTML = `
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Informations Utilisateur</h3>
                            <div class="space-y-3">
                                <div class="flex items-center space-x-4">
                                    <img 
                                        src="${user.picture || '/assets/default-avatar.png'}" 
                                        alt="Avatar" 
                                        class="w-16 h-16 rounded-full border-2 border-gray-200"
                                        onerror="this.src='/assets/default-avatar.png'"
                                    />
                                    <div>
                                        <p class="font-semibold text-gray-800">${user.name || 'N/A'}</p>
                                        <p class="text-gray-600">${user.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <p class="text-sm font-medium text-gray-500">ID Auth0</p>
                                        <p class="text-sm text-gray-800 break-all">${user.sub || 'N/A'}</p>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <p class="text-sm font-medium text-gray-500">Email Vérifié</p>
                                        <p class="text-sm text-gray-800">${user.email_verified ? 'Oui' : 'Non'}</p>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <p class="text-sm font-medium text-gray-500">Dernière Mise à Jour</p>
                                        <p class="text-sm text-gray-800">${user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded-lg">
                                        <p class="text-sm font-medium text-gray-500">Nickname</p>
                                        <p class="text-sm text-gray-800">${user.nickname || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        userInfoDiv.innerHTML = `
                            <div class="text-center text-yellow-600">
                                <p>Impossible de récupérer les informations utilisateur</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des informations utilisateur:', error);
                    userInfoDiv.innerHTML = `
                        <div class="text-center text-red-600">
                            <p>Erreur lors de la récupération des informations utilisateur</p>
                        </div>
                    `;
                }

                // Actions pour utilisateur connecté
                actionsDiv.innerHTML = `
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                    <div class="flex flex-wrap gap-4">
                        <button id="logout-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                            Se Déconnecter
                        </button>
                        <button id="refresh-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            Actualiser
                        </button>
                        <button id="choice-game-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                            Aller au Jeu
                        </button>
                    </div>
                `;

                // Ajouter les événements
                const logoutBtn = actionsDiv.querySelector('#logout-btn') as HTMLButtonElement;
                const refreshBtn = actionsDiv.querySelector('#refresh-btn') as HTMLButtonElement;
                const choiceGameBtn = actionsDiv.querySelector('#choice-game-btn') as HTMLButtonElement;

                logoutBtn?.addEventListener('click', async () => {
                    try {
                        logoutBtn.disabled = true;
                        logoutBtn.textContent = 'Déconnexion...';
                        await logout();
                    } catch (error) {
                        console.error('Erreur lors de la déconnexion:', error);
                        logoutBtn.disabled = false;
                        logoutBtn.textContent = 'Se Déconnecter';
                        alert('Erreur lors de la déconnexion');
                    }
                });

                refreshBtn?.addEventListener('click', () => updateStatus());
                choiceGameBtn?.addEventListener('click', () => navigate('/choice-game'));

            } else {
                // Utilisateur non connecté
                statusDiv.innerHTML = `
                    <div class="text-center">
                        <div class="text-red-600 text-6xl mb-4">❌</div>
                        <h3 class="text-xl font-semibold text-red-600 mb-2">Utilisateur Non Connecté</h3>
                        <p class="text-gray-600">Vous n'êtes pas authentifié</p>
                    </div>
                `;

                userInfoDiv.innerHTML = `
                    <div class="text-center text-gray-500">
                        <p>Connectez-vous pour voir vos informations</p>
                    </div>
                `;

                // Actions pour utilisateur non connecté
                actionsDiv.innerHTML = `
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                    <div class="flex flex-wrap gap-4">
                        <button id="login-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            Se Connecter
                        </button>
                        <button id="refresh-btn" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                            Actualiser
                        </button>
                    </div>
                `;

                // Ajouter les événements
                const loginBtn = actionsDiv.querySelector('#login-btn') as HTMLButtonElement;
                const refreshBtn = actionsDiv.querySelector('#refresh-btn') as HTMLButtonElement;

                loginBtn?.addEventListener('click', () => navigate('/login'));
                refreshBtn?.addEventListener('click', () => updateStatus());
            }

        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            statusDiv.innerHTML = `
                <div class="text-center">
                    <div class="text-red-600 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-semibold text-red-600 mb-2">Erreur</h3>
                    <p class="text-gray-600">Impossible de vérifier le statut d'authentification</p>
                </div>
            `;

            actionsDiv.innerHTML = `
                <div class="text-center">
                    <button id="retry-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Réessayer
                    </button>
                </div>
            `;

            const retryBtn = actionsDiv.querySelector('#retry-btn') as HTMLButtonElement;
            retryBtn?.addEventListener('click', () => updateStatus());
        }
    };

    // Bouton retour
    const backButton = document.createElement('button');
    backButton.className = 'mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200';
    backButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Retour</span>
    `;
    backButton.onclick = () => navigate('/');
    container.insertBefore(backButton, title);

    // Charger le statut au démarrage
    updateStatus();

    return mainDiv;
};