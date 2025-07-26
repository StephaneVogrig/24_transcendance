import { isAuthenticated, getUser, logout } from '../auth/auth0Service';
import { navigate } from '../router';

import { notConnected, Connected } from '../utils/ProfileUtils';


// Fonction utilitaire 
const createErrorMessage = (message: string, type: 'error' | 'warning' | 'info' = 'warning'): HTMLElement => {
    const container = document.createElement('div');
    const colorClass = {
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
    }[type];
    
    container.className = `text-center ${colorClass}`;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    container.appendChild(paragraph);
    
    return container;
};


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
                    </div>
                `;

                // Récupérer les informations utilisateur
                try 
                {
                    const user = await getUser();
                    if (user)  // utilisateur connecté
                    {
                        userInfoDiv.innerHTML = '';    // Clear previous content
                        Connected(user, userInfoDiv);
                    } 
                    else // si erreur lors de la récupération des informations utilisateur 
                    {
                        userInfoDiv.innerHTML =  '';
                        userInfoDiv.appendChild(createErrorMessage('Impossible de récupérer les informations utilisateur', 'warning'));
                    }
                } 
                catch (error) 
                {
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
                        <button id="choice-game-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                            Aller au Jeu
                        </button>
                    </div>
                `;

                // Ajouter les événements
                const logoutBtn = actionsDiv.querySelector('#logout-btn') as HTMLButtonElement;
    
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


                choiceGameBtn?.addEventListener('click', () => navigate('/choice-game'));

            } 
            else // Utilisateur non connecté
            {
                notConnected(statusDiv, userInfoDiv, actionsDiv);
                
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